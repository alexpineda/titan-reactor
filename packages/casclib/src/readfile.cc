#include <string>
#include <vector>
#include <CascLib.h>
#include "napi.h"

#include "errors.h"
#include "readfile.h"

LPBYTE* ReadFile(const HANDLE fileHandle, DWORD* fileSize) {
    *fileSize = CascGetFileSize(fileHandle, NULL);
    LPBYTE* fileData = new LPBYTE[*fileSize]();

    DWORD read = 0;
    if(!CascReadFile(fileHandle, fileData, *fileSize, &read)) {
        return nullptr;
    }

    if(*fileSize != read) {
        return nullptr;
    }

    return fileData;
}

void FinalizeFileData(Napi::Env env, LPBYTE* data) {
    delete [] data;
}

bool ValidateReadArguments(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 1) {
        errors::ThrowJavascriptTypeError(env, "Wrong number of arguments");
        return false;
    }

    if(info[0].IsNull() || info[0].IsUndefined()) {
        errors::ThrowJavascriptTypeError(env, "fileHandle must be defined.");
        return false;
    }

    return true;
}

Napi::Value CascReadSync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateReadArguments(info)) {
        return env.Null();
    }

    HANDLE fileHandle = (HANDLE)info[0].As<Napi::External<void>>().Data();

    DWORD fileSize = CascGetFileSize(fileHandle, NULL);
    LPBYTE* fileData = new LPBYTE[fileSize]();

    DWORD read = 0;
    if(!CascReadFile(fileHandle, fileData, fileSize, &read)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Failed to read file.");
        return env.Null();
    }

    if(fileSize != read) {
        errors::ThrowJavascriptTypeError(env, "Failed to read entire file.");
        return env.Null();
    }

    return Napi::Buffer<LPBYTE>::New(env, fileData, fileSize, FinalizeFileData);
}

Napi::Value CascRead(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateReadArguments(info)) {
        return env.Null();
    }

    HANDLE fileHandle = (HANDLE)info[0].As<Napi::External<void>>().Data();

    if(info.Length() >= 2 && info[1].IsFunction()) {
        Napi::Function callback = info[1].As<Napi::Function>();
        readfile::ReadAsyncWorker* worker = new readfile::ReadAsyncWorker(callback, fileHandle);
        worker->Queue();

        return env.Null();
    }
    else {
        Napi::Promise::Deferred deferred(env);
        readfile::PromiseReadAsyncWorker* worker = new readfile::PromiseReadAsyncWorker(deferred, fileHandle);
        worker->Queue();

        return deferred.Promise();
    }
}

Napi::Value ReadCascFileBuffer(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 3) {
        errors::ThrowJavascriptTypeError(env, "Wrong number of arguments");
        return env.Null();
    }

    if(info[0].IsNull() || info[0].IsUndefined()) {
        errors::ThrowJavascriptTypeError(env, "fileHandle must be defined.");
        return env.Null();
    }

    if(!info[1].IsNumber()) {
        errors::ThrowJavascriptTypeError(env, "readSize must be a number");
        return env.Null();
    }

    if(!info[2].IsFunction()) {
        errors::ThrowJavascriptTypeError(env, "callback must be a function");
        return env.Null();
    }

    HANDLE fileHandle = (HANDLE)info[0].As<Napi::External<void>>().Data();
    DWORD readSize = info[1].As<Napi::Number>().Uint32Value();
    Napi::Function callback = info[2].As<Napi::Function>();

    readfile::ReadBufferAsyncWorker* worker = new readfile::ReadBufferAsyncWorker(callback, fileHandle, readSize);
    worker->Queue();

    return env.Null();
}

////////////////////////////////////////////////////////////////////////////////
// ReadAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

readfile::ReadAsyncWorker::ReadAsyncWorker(const Napi::Function& callback, const HANDLE fileHandle)
    : Napi::AsyncWorker(callback), fileHandle { fileHandle } {

}

void readfile::ReadAsyncWorker::Execute() {
    fileSize = CascGetFileSize(fileHandle, NULL);
    fileData = new LPBYTE[fileSize]();

    DWORD read = 0;
    if(!CascReadFile(fileHandle, fileData, fileSize, &read)) {
        string message = errors::ErrorMessage("Failed to read file.", GetLastError());
        SetError(message);
        return;
    }

    if(fileSize != read) {
        SetError("Failed to read the entire file.");
    }
}

void readfile::ReadAsyncWorker::OnOK() {
    Callback().MakeCallback(Receiver().Value(), std::initializer_list<napi_value>{ Env().Undefined(), Data() });
}

Napi::Value readfile::ReadAsyncWorker::Data() {
    return Napi::Buffer<LPBYTE>::New(Env(), fileData, fileSize, FinalizeFileData);
}

////////////////////////////////////////////////////////////////////////////////
// PromiseReadAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

// Empty callback for Promise AsyncWorker
void ReadFilePromiseCallback(const Napi::CallbackInfo& info) {

}

readfile::PromiseReadAsyncWorker::PromiseReadAsyncWorker(const Napi::Promise::Deferred& deferred, const HANDLE fileHandle)
    : readfile::ReadAsyncWorker(Napi::Function::New(deferred.Promise().Env(), ReadFilePromiseCallback), fileHandle),
    deferred { deferred } {

}

void readfile::PromiseReadAsyncWorker::OnOK() {
    deferred.Resolve(Data());
}

void readfile::PromiseReadAsyncWorker::OnError(const Napi::Error& e) {
    deferred.Reject(e.Value());
}

////////////////////////////////////////////////////////////////////////////////
// ReadBufferAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

readfile::ReadBufferAsyncWorker::ReadBufferAsyncWorker(const Napi::Function& callback, const HANDLE fileHandle, const DWORD size)
    : Napi::AsyncWorker(callback), fileHandle { fileHandle }, size { size } {

}

void readfile::ReadBufferAsyncWorker::Execute() {
    fileData = new LPBYTE[size]();
    if(!CascReadFile(fileHandle, fileData, size, &read)) {
        string message = errors::ErrorMessage("Failed to read file data.", GetLastError());
        SetError(message);
    }
}

void readfile::ReadBufferAsyncWorker::OnOK() {
    Callback().MakeCallback(Receiver().Value(), std::initializer_list<napi_value>{ Env().Undefined(), Data() });
}

Napi::Value readfile::ReadBufferAsyncWorker::Data() {
    return Napi::Buffer<LPBYTE>::New(Env(), fileData, read, FinalizeFileData);
}

////////////////////////////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////////////////////////////

void readfile::Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "cascReadSync"),
        Napi::Function::New(env, CascReadSync)
    );

    exports.Set(
        Napi::String::New(env, "cascRead"),
        Napi::Function::New(env, CascRead)
    );

    exports.Set(
        Napi::String::New(env, "readCascFileBuffer"),
        Napi::Function::New(env, ReadCascFileBuffer)
    );
}
