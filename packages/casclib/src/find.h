#pragma once

#include <string>
#include <vector>
#include <memory>
#include <CascLib.h>
#include "napi.h"

using namespace std;

namespace find {
    class FindResult {
    public:
        FindResult(const string& fullName, const string& baseName, const DWORD fileSize)
            : fullName { fullName }, baseName { baseName }, fileSize { fileSize } {

        }

        Napi::Object ToObject(Napi::Env env) {
            Napi::Object object = Napi::Object::New(env);

            object.Set(
                Napi::String::New(env, "fullName"),
                Napi::String::New(env, fullName)
            );

            object.Set(
                Napi::String::New(env, "baseName"),
                Napi::String::New(env, baseName)
            );

            object.Set(
                Napi::String::New(env, "fileSize"),
                Napi::Number::New(env, fileSize)
            );

            return object;
        }

    private:
        const string fullName;
        const string baseName;
        const DWORD fileSize;
    };

    class FindAsyncWorker : public Napi::AsyncWorker {
    public:
        FindAsyncWorker(const Napi::Function& callback, const HANDLE storageHandle, const string& searchPattern, const string& listFilePath);

    protected:
        void Execute() override;
        void OnOK() override;

        Napi::Value FindResults();

    private:
        HANDLE storageHandle;
        const string searchPattern;
        const string listFilePath;
        vector<unique_ptr<find::FindResult>> results;
    };

    class PromiseFindAsyncWorker : public find::FindAsyncWorker {
    public:
        PromiseFindAsyncWorker(const Napi::Promise::Deferred& deferred, const HANDLE storageHandle, const string& searchPattern, const string& listFilePath);

    protected:
        void OnOK() override;
        void OnError(const Napi::Error& e) override;

    private:
        Napi::Promise::Deferred deferred;
    };

    void Init(Napi::Env env, Napi::Object exports);
}
