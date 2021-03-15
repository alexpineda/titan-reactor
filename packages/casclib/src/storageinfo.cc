#include <CascLib.h>
#include <CascCommon.h>
#include "napi.h"

#include "errors.h"
#include "storageinfo.h"

using namespace std;
using namespace storageinfo;

const char* storageinfo::GameName(const DWORD gameData) {
    switch(gameData & CASC_GAME_MASK) {
        case CASC_GAME_HOTS:
            return gameHeroes;
        case CASC_GAME_WOW6:
            return gameWOW;
        case CASC_GAME_DIABLO3:
            return gameDiablo3;
        case CASC_GAME_OVERWATCH:
            return gameOverwatch;
        case CASC_GAME_STARCRAFT1:
            return gameSC1;
        case CASC_GAME_STARCRAFT2:
            return gameSC2;
        default:
            return gameUnknown;
    }
}

Napi::Value storageinfo::GetCascStorageInfo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 1) {
      errors::ThrowJavascriptTypeError(env, "Wrong number of arguments");
      return env.Null();
    }

    if(info[0].IsEmpty() || info[0].IsUndefined() || info[0].IsNull()) {
        errors::ThrowJavascriptTypeError(env, "Storage handle must defined.");
        return env.Null();
    }

    Napi::Object storageInfo = Napi::Object::New(env);
    HANDLE hStorage = (HANDLE)info[0].As<Napi::External<void>>().Data();
    DWORD data = 0;

    if(!CascGetStorageInfo(hStorage, CascStorageFileCount, &data, sizeof(data), NULL)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Failed to read storage information.");
        return env.Null();
    }

    storageInfo.Set(
        Napi::String::New(env, "fileCount"),
        Napi::Number::New(env, data)
    );

    if(!CascGetStorageInfo(hStorage, CascStorageGameInfo, &data, sizeof(data), NULL)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Failed to read storage information.");
        return env.Null();
    }
    storageInfo.Set(
        Napi::String::New(env, "gameName"),
        Napi::String::New(env, GameName(data))
    );

    if(!CascGetStorageInfo(hStorage, CascStorageGameBuild, &data, sizeof(data), NULL)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Failed to read storage information.");
        return env.Null();
    }
    storageInfo.Set(
        Napi::String::New(env, "gameBuild"),
        Napi::Number::New(env, data)
    );

    if(!CascGetStorageInfo(hStorage, CascStorageInstalledLocales, &data, sizeof(data), NULL)) {
        errors::ThrowJavascriptErrorWithLastError(env, "Failed to read storage information.");
        return env.Null();
    }
    storageInfo.Set(
        Napi::String::New(env, "installedLocales"),
        Napi::Number::New(env, data)
    );

    return storageInfo;
}

void storageinfo::Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "getCascStorageInfo"),
        Napi::Function::New(env, GetCascStorageInfo)
    );
}
