#include <string>
#include <CascLib.h>
#include "napi.h"

#include "errors.h"
#include "locales.h"
#include "openfile.h"

bool ValidateOpenFileArguments(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 2) {
        errors::ThrowJavascriptTypeError(env, "Wrong number of arguments");
        return false;
    }

    if(info[0].IsNull() || info[0].IsUndefined()) {
        errors::ThrowJavascriptTypeError(env, "storageHandle must be defined");
        return false;
    }

    if(!info[1].IsString()) {
        errors::ThrowJavascriptTypeError(env, "fileName must be a string");
        return false;
    }

    return true;
}

Napi::Value OpenCascFileSync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateOpenFileArguments(info)) {
        return env.Null();
    }

    HANDLE hStorage = (HANDLE)info[0].As<Napi::External<void>>().Data();
    string fileName = info[1].As<Napi::String>().Utf8Value();

    HANDLE fileHandle;
    if(!CascOpenFile(hStorage, fileName.c_str(), CASC_LOCALE_ALL, 0, &fileHandle)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Unable to open file.");

        return env.Null();
    }

    return Napi::External<void>::New(env, (void*)fileHandle);
}

Napi::Value OpenCascFile(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateOpenFileArguments(info)) {
        return env.Null();
    }

    HANDLE hStorage = (HANDLE)info[0].As<Napi::External<void>>().Data();
    string fileName = info[1].As<Napi::String>().Utf8Value();

    if(info.Length() >= 3 && info[2].IsFunction()) {
        Napi::Function callback = info[2].As<Napi::Function>();
        openfile::OpenAsyncWorker* worker = new openfile::OpenAsyncWorker(callback, hStorage, fileName);
        worker->Queue();

        return env.Null();
    }
    else {
        Napi::Promise::Deferred deferred(env);
        openfile::PromiseOpenAsyncWorker* worker = new openfile::PromiseOpenAsyncWorker(deferred, hStorage, fileName);
        worker->Queue();

        return deferred.Promise();
    }
}

void CloseCascFile(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 1) {
        errors::ThrowJavascriptTypeError(env, "fileHandle is required.");
        return;
    }

    if(info[0].IsNull() || info[0].IsUndefined()) {
        errors::ThrowJavascriptTypeError(env, "fileHandle cannot be null or undefined.");
        return;
    }

    HANDLE fileHandle = (HANDLE)info[0].As<Napi::External<void>>().Data();
    if(!CascCloseFile(fileHandle)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Unable to close file.");
    }
}

////////////////////////////////////////////////////////////////////////////////
// OpenAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

openfile::OpenAsyncWorker::OpenAsyncWorker(const Napi::Function& callback, const HANDLE storageHandle, const string& fileName)
    : Napi::AsyncWorker(callback), storageHandle { storageHandle }, fileName { fileName } {

}

void openfile::OpenAsyncWorker::Execute() {
    if(!CascOpenFile(storageHandle, fileName.c_str(), CASC_LOCALE_ALL, 0, &fileHandle)) {
        int errorCode = GetLastError();
        string errorMessage = errors::ErrorMessage("Unable to open file.", errorCode);
        SetError(errorMessage);
    }
}

void openfile::OpenAsyncWorker::OnOK() {
    Callback().MakeCallback(Receiver().Value(), std::initializer_list<napi_value>{ Env().Undefined(), FileHandle() });
}

Napi::Value openfile::OpenAsyncWorker::FileHandle() {
    return Napi::External<void>::New(Env(), (void*)fileHandle);
}

////////////////////////////////////////////////////////////////////////////////
// PromiseOpenAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

// Empty callback for Promise AsyncWorker
void PromiseOpenFileCallback(const Napi::CallbackInfo& info) {

}

openfile::PromiseOpenAsyncWorker::PromiseOpenAsyncWorker(const Napi::Promise::Deferred& deferred, const HANDLE storageHandle, const string& fileName)
    : openfile::OpenAsyncWorker(Napi::Function::New(deferred.Promise().Env(), PromiseOpenFileCallback), storageHandle, fileName),
    deferred { deferred } {

}

void openfile::PromiseOpenAsyncWorker::OnOK() {
    deferred.Resolve(FileHandle());
}

void openfile::PromiseOpenAsyncWorker::OnError(const Napi::Error& e) {
    deferred.Reject(e.Value());
}

////////////////////////////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////////////////////////////

void openfile::Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "openCascFileSync"),
        Napi::Function::New(env, OpenCascFileSync)
    );

    exports.Set(
        Napi::String::New(env, "openCascFile"),
        Napi::Function::New(env, OpenCascFile)
    );

    exports.Set(
        Napi::String::New(env, "closeCascFile"),
        Napi::Function::New(env, CloseCascFile)
    );
}
