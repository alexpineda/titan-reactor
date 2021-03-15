#include <CascLib.h>
#include "napi.h"

#include "locales.h"
#include "errors.h"

using namespace std;
using namespace locales;
void locales::Init(Napi::Env env, Napi::Object exports) {
    Napi::Object localesObject = Napi::Object::New(env);

    int length = sizeof(LOCALES) / sizeof(LOCALE);
    for(int i = 0; i < length; i++) {
        LOCALE locale = LOCALES[i];
        localesObject.Set(
            Napi::String::New(env, locale.shortName),
            Napi::Number::New(env, locale.mask)
        );
    }

    exports.Set(
        Napi::String::New(env, "locales"),
        localesObject
    );
}
