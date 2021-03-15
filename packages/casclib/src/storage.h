#pragma once

#include <CascLib.h>
#include "napi.h"

namespace storage {
    class OpenAsyncWorker : public Napi::AsyncWorker {
    public:
        OpenAsyncWorker(const Napi::Function& callback, const string& storagePath, const DWORD localeMask);

    protected:
        void Execute() override;
        void OnOK() override;

        Napi::Value StorageHandle();

    private:
        const string storagePath;
        const DWORD localeMask;
        HANDLE storageHandle;
    };

    class PromiseOpenAsyncWorker : public storage::OpenAsyncWorker {
    public:
        PromiseOpenAsyncWorker(const Napi::Promise::Deferred& deferred, const string& storagePath, const DWORD localeMask);

    protected:
        void OnOK() override;
        void OnError(const Napi::Error& e) override;

    private:
        Napi::Promise::Deferred deferred;
    };

    void Init(Napi::Env env, Napi::Object exports);
}
