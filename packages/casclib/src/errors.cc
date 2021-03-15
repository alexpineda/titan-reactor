#include <string>
#include <CascLib.h>
#include <CascPort.h>
#include "napi.h"
#include "errors.h"

using namespace std;
using namespace errors;

void errors::ThrowJavascriptError(Napi::Env env, const string& message) {
    Napi::Error::New(env, message)
        .ThrowAsJavaScriptException();
}

void errors::ThrowJavascriptTypeError(Napi::Env env, const string& message) {
    Napi::TypeError::New(env, message)
        .ThrowAsJavaScriptException();
}

void errors::ThrowJavascriptErrorWithLastError(Napi::Env env, const string& message) {
    int errorCode = GetLastError();

    string errorMessage = ErrorMessage(message, errorCode);

    ThrowJavascriptError(env, errorMessage);
}

string errors::ErrorMessage(const string& message, const int errorCode) {
    return string(message) + " " + FormatedErrorCodeMessage(errorCode);
}

string errors::FormatedErrorCodeMessage(const int errorCode) {
    return string(errors::ErrorCodeToMessage(errorCode)) + " (CascLib:" + to_string(errorCode) + ")";
}

const char* errors::ErrorCodeToMessage(const int errorCode) {
    switch(errorCode) {
        case ERROR_INVALID_PARAMETER:
            return invalidParameter;

        case ERROR_INVALID_HANDLE:
            return invalidHandle;

        case ERROR_INSUFFICIENT_BUFFER:
            return insufficientBuffer;

        case ERROR_NOT_ENOUGH_MEMORY:
            return notEnoughMemory;

        case ERROR_FILE_NOT_FOUND:
            return fileNotFound;

        case ERROR_FILE_CORRUPT:
            return fileCorrupt;
            
        default:
            return "";
    }
}
