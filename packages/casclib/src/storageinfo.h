#pragma once

#include "napi.h"

namespace storageinfo {
    constexpr char gameHeroes[] = "Heroes of the Storm";
    constexpr char gameWOW[] = "World of Warcraft";
    constexpr char gameDiablo3[] = "Diablo 3";
    constexpr char gameOverwatch[] = "Overwatch";
    constexpr char gameSC1[] = "Starcraft";
    constexpr char gameSC2[] = "Starcraft II";
    constexpr char gameUnknown[] = "Unknown";

    const char* GameName(const DWORD gameData);
    Napi::Value GetCascStorageInfo(const Napi::CallbackInfo& info);

    void Init(Napi::Env env, Napi::Object exports);
}
