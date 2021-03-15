#include <string>
#include <vector>
#include <memory>

#include <CascLib.h>
#include "napi.h"

#include "errors.h"
#include "find.h"

using namespace std;
using namespace find;

bool ValidateFindCascFilesArguments(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 2) {
        errors::ThrowJavascriptTypeError(env, "Wrong number of arguments");
        return false;
    }

    if(!info[1].IsString()) {
        errors::ThrowJavascriptTypeError(env, "searchPattern must be a string");
        return false;
    }

    if(info.Length() >= 2 && !info[2].IsString()) {
        errors::ThrowJavascriptTypeError(env, "listFilePath must be a string");
        return false;
    }

    return true;
}

vector<unique_ptr<FindResult>> FindFiles(HANDLE storageHandle, const char* searchPattern, const char* listFilePath) {
    CASC_FIND_DATA findData;
    vector<unique_ptr<FindResult>> results;

    HANDLE searchHandle = CascFindFirstFile(storageHandle, searchPattern, &findData, listFilePath);

    if(searchHandle == INVALID_HANDLE_VALUE) {
        return results;
    }

    do {
        unique_ptr<FindResult> result(new FindResult(findData.szFileName, findData.szPlainName, findData.dwFileSize));
        results.push_back(move(result));
    }
    while(CascFindNextFile(searchHandle, &findData));

    CascFindClose(searchHandle);

    return results;
}

Napi::Value FindResultsToValue(const Napi::Env env, vector<unique_ptr<FindResult>>& findResults) {
    Napi::Array array = Napi::Array::New(env);

    for(unsigned int i = 0; i < findResults.size(); i++) {
        unique_ptr<FindResult> result = move(findResults.at(i));
        array.Set(
            Napi::Number::New(env, i),
            result->ToObject(env)
        );
    }

    findResults.clear();

    return array;
}

Napi::Value FindCascFilesSync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateFindCascFilesArguments(info)) {
        return env.Null();
    }

    HANDLE hStorage = (HANDLE)info[0].As<Napi::External<void>>().Data();
    string searchPattern = info[1].As<Napi::String>().Utf8Value();

    string listFilePath;
    if(info.Length() >= 3 && info[2].IsString()) {
        listFilePath = info[2].As<Napi::String>().Utf8Value();
    }

    vector<unique_ptr<FindResult>> findResults = FindFiles(hStorage, searchPattern.c_str(), listFilePath.c_str());
    return FindResultsToValue(env, findResults);
}

Napi::Value FindCascFiles(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(!ValidateFindCascFilesArguments(info)) {
        return env.Null();
    }

    HANDLE hStorage = (HANDLE)info[0].As<Napi::External<void>>().Data();
    string searchPattern = info[1].As<Napi::String>().Utf8Value();

    string listFilePath;
    if(info.Length() >= 3 && info[2].IsString()) {
        listFilePath = info[2].As<Napi::String>().Utf8Value();
    }

    if(info.Length() >= 4 && info[3].IsFunction()) {
        Napi::Function callback = info[3].As<Napi::Function>();
        FindAsyncWorker* worker = new FindAsyncWorker(callback, hStorage, searchPattern.c_str(), listFilePath.c_str());
        worker->Queue();

        return env.Null();
    }
    else {
        Napi::Promise::Deferred deferred(env);
        PromiseFindAsyncWorker* worker = new PromiseFindAsyncWorker(deferred, hStorage, searchPattern.c_str(), listFilePath.c_str());
        worker->Queue();

        return deferred.Promise();
    }
}

////////////////////////////////////////////////////////////////////////////////
// FindAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

find::FindAsyncWorker::FindAsyncWorker(const Napi::Function& callback, const HANDLE storageHandle, const string& searchPattern, const string& listFilePath)
    : Napi::AsyncWorker(callback), storageHandle { storageHandle }, searchPattern { searchPattern }, listFilePath { listFilePath } {

}

Napi::Value find::FindAsyncWorker::FindResults() {
    return FindResultsToValue(Env(), results);
}

void find::FindAsyncWorker::Execute() {
    results = FindFiles(storageHandle, searchPattern.c_str(), listFilePath.c_str());
}

void find::FindAsyncWorker::OnOK() {
    Callback().MakeCallback(Receiver().Value(), std::initializer_list<napi_value>{ Env().Undefined(), FindResults() });
}

////////////////////////////////////////////////////////////////////////////////
// PromiseFindAsyncWorker class
////////////////////////////////////////////////////////////////////////////////

// Empty callback for Promise AsyncWorker
void PromiseFindCallback(const Napi::CallbackInfo& info) {

}

find::PromiseFindAsyncWorker::PromiseFindAsyncWorker(
    const Napi::Promise::Deferred& deferred,
    const HANDLE storageHandle,
    const string& searchPattern,
    const string& listFilePath
)
    : find::FindAsyncWorker(
        Napi::Function::New(deferred.Promise().Env(), PromiseFindCallback),
        storageHandle,
        searchPattern,
        listFilePath
    ),
    deferred { deferred } {

}

void find::PromiseFindAsyncWorker::OnOK() {
    deferred.Resolve(FindResults());
}

void find::PromiseFindAsyncWorker::OnError(const Napi::Error& e) {
    deferred.Reject(e.Value());
}

////////////////////////////////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////////////////////////////////

void find::Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "findCascFilesSync"),
        Napi::Function::New(env, FindCascFilesSync)
    );

    exports.Set(
        Napi::String::New(env, "findCascFiles"),
        Napi::Function::New(env, FindCascFiles)
    );
}
