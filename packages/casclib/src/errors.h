#pragma once

#include <string>
#include "napi.h"

using namespace std;

namespace errors {
    constexpr char invalidParameter[] = "Invalid parameter.";
    constexpr char invalidHandle[] = "Invalid handle.";
    constexpr char insufficientBuffer[] = "Insufficient buffer.";
    constexpr char notEnoughMemory[] = "Not enough memory.";
    constexpr char fileNotFound[] = "File not found.";
    constexpr char fileCorrupt[] = "File corrupt.";

    void ThrowJavascriptError(Napi::Env env, const string& message);
    void ThrowJavascriptTypeError(Napi::Env env, const string& message);
    void ThrowJavascriptErrorWithLastError(Napi::Env env, const string& message);
    string ErrorMessage(const string& message, const int errorCode);
    string FormatedErrorCodeMessage(const int errorCode);
    const char* ErrorCodeToMessage(const int errorCode);
}
