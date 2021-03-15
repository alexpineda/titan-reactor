#pragma once

#include <CascLib.h>
#include "napi.h"

namespace openfile {
    class OpenAsyncWorker : public Napi::AsyncWorker {
    public:
        OpenAsyncWorker(const Napi::Function& callback, const HANDLE storageHandle, const string& fileName);

    protected:
        void Execute() override;
        void OnOK() override;

        Napi::Value FileHandle();

    private:
        HANDLE storageHandle;
        HANDLE fileHandle;
        const string fileName;
    };

    class PromiseOpenAsyncWorker : public OpenAsyncWorker {
    public:
        PromiseOpenAsyncWorker(const Napi::Promise::Deferred& deferred, const HANDLE storageHandle, const string& fileName);

    protected:
        void OnOK() override;
        void OnError(const Napi::Error& e) override;

    private:
        Napi::Promise::Deferred deferred;
    };

    void Init(Napi::Env env, Napi::Object exports);
}
