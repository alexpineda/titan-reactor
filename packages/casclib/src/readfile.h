#pragma once

#include <CascLib.h>
#include "napi.h"

namespace readfile {
    constexpr int bufferSize = 16000;

    class ReadAsyncWorker : public Napi::AsyncWorker {
    public:
        ReadAsyncWorker(const Napi::Function& callback, const HANDLE fileHandle);

    protected:
        void Execute() override;
        void OnOK() override;

        Napi::Value Data();

    private:
        HANDLE fileHandle;
        DWORD fileSize;
        LPBYTE* fileData;
    };

    class PromiseReadAsyncWorker : public ReadAsyncWorker {
    public:
        PromiseReadAsyncWorker(const Napi::Promise::Deferred& deferred, const HANDLE fileHandle);

    protected:
        void OnOK() override;
        void OnError(const Napi::Error& e) override;

    private:
        Napi::Promise::Deferred deferred;
    };

    class ReadBufferAsyncWorker : public Napi::AsyncWorker {
    public:
        ReadBufferAsyncWorker(const Napi::Function& callback, const HANDLE fileHandle, const DWORD size);

    protected:
        void Execute() override;
        void OnOK() override;

        Napi::Value Data();

    private:
        HANDLE fileHandle;
        const DWORD size;
        DWORD read = 0;
        LPBYTE* fileData;
    };

    void Init(Napi::Env env, Napi::Object exports);
}
