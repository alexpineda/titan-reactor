#include <string>
#include <CascLib.h>
#include "node_api.h"
#include "napi.h"

#include "errors.h"
#include "storage.h"

bool ValidateOpenStorageArguments(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 1) {
        errors::ThrowJavascriptTypeError(env, "Wrong number of arguments");
        return false;
    }

    if(!info[0].IsString()) {
        errors::ThrowJavascriptTypeError(env, "CASC storage path must be a string");
        return false;
    }

    if(info.Length() >= 2 && !info[1].IsNumber()) {
        errors::ThrowJavascriptTypeError(env, "localeMask must be a bit mask");
        return false;
    }

    return true;
}

int GetLocaleMask(const Napi::CallbackInfo& info) {
    if(info.Length() >= 2 && info[1].IsNumber()) {
        return info[1].As<Napi::Number>().Uint32Value();
    }

    return CASC_LOCALE_ALL;
}

Napi::Value OpenCascStorageSync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateOpenStorageArguments(info)) {
        return env.Null();
    }

    int localeMask = GetLocaleMask(info);
    Napi::String storagePath = info[0].As<Napi::String>();

    HANDLE hStorage;
    if(!CascOpenStorage(storagePath.Utf8Value().c_str(), localeMask, &hStorage)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Unable to open CASC storage.");

        return env.Null();
    }

    return Napi::External<void>::New(env, (void*)hStorage);
}

Napi::Value OpenCascStorage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateOpenStorageArguments(info)) {
        return env.Null();
    }

    int localeMask = GetLocaleMask(info);
    Napi::String storagePath = info[0].As<Napi::String>();

    if(info.Length() >= 3 && info[2].IsFunction()) {
        Napi::Function callback = info[2].As<Napi::Function>();
        storage::OpenAsyncWorker* worker = new storage::OpenAsyncWorker(callback, storagePath.Utf8Value(), localeMask);
        worker->Queue();

        return env.Null();
    }
    else {
        Napi::Promise::Deferred deferred(env);
        storage::PromiseOpenAsyncWorker* worker = new storage::PromiseOpenAsyncWorker(deferred, storagePath.Utf8Value(), localeMask);
        worker->Queue();

        return deferred.Promise();
    }
}

void CloseCascStorage(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 1) {
        errors::ThrowJavascriptTypeError(env, "storageHandle is required.");
        return;
    }

    if(info[0].IsNull() || info[0].IsUndefined()) {
        errors::ThrowJavascriptTypeError(env, "storageHandle cannot be null or undefined.");
        return;
    }

    HANDLE hStorage = (HANDLE)info[0].As<Napi::External<void>>().Data();
    if(!CascCloseStorage(hStorage)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Unable to close CASC storage.");
    }
}


////////////////////////////////////////////////////////////////////////////////
// OpenAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

storage::OpenAsyncWorker::OpenAsyncWorker(const Napi::Function& callback, const string& storagePath, const DWORD localeMask)
    : Napi::AsyncWorker(callback), storagePath { storagePath }, localeMask { localeMask } {

}

void storage::OpenAsyncWorker::Execute() {
    if(!CascOpenStorage(storagePath.c_str(), localeMask, &storageHandle)) {
        int errorCode = GetLastError();
        string errorMessage = errors::ErrorMessage("Unable to open CASC storage.", errorCode);
        SetError(errorMessage);
    }
}

void storage::OpenAsyncWorker::OnOK() {
    Callback().MakeCallback(Receiver().Value(), std::initializer_list<napi_value>{ Env().Undefined(), StorageHandle() });
}

Napi::Value storage::OpenAsyncWorker::StorageHandle() {
    return Napi::External<void>::New(Env(), (void*)storageHandle);
}

////////////////////////////////////////////////////////////////////////////////
// PromiseOpenAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

// Empty callback for Promise AsyncWorker
void PromiseOpenCallback(const Napi::CallbackInfo& info) {

}

storage::PromiseOpenAsyncWorker::PromiseOpenAsyncWorker(const Napi::Promise::Deferred& deferred, const string& storagePath, const DWORD localeMask)
    : storage::OpenAsyncWorker(Napi::Function::New(deferred.Promise().Env(), PromiseOpenCallback), storagePath, localeMask),
    deferred { deferred } {

}

void storage::PromiseOpenAsyncWorker::OnOK() {
    deferred.Resolve(StorageHandle());
}

void storage::PromiseOpenAsyncWorker::OnError(const Napi::Error& e) {
    deferred.Reject(e.Value());
}

////////////////////////////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////////////////////////////

void storage::Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "openCascStorageSync"),
        Napi::Function::New(env, OpenCascStorageSync)
    );

    exports.Set(
        Napi::String::New(env, "openCascStorage"),
        Napi::Function::New(env, OpenCascStorage)
    );

    exports.Set(
        Napi::String::New(env, "closeCascStorage"),
        Napi::Function::New(env, CloseCascStorage)
    );
}
