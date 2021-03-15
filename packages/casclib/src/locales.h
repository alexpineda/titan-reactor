#pragma once

#include <CascLib.h>

namespace locales {
    struct LOCALE {
        DWORD mask;
        const char* shortName;
    } const LOCALES[] = {
        { CASC_LOCALE_ALL, "ALL" },
        { CASC_LOCALE_NONE, "NONE" },
        { CASC_LOCALE_UNKNOWN1, "UNKNOWN1" },
        { CASC_LOCALE_ENUS, "ENUS" },
        { CASC_LOCALE_KOKR, "KOKR" },
        { CASC_LOCALE_RESERVED, "RESERVED" },
        { CASC_LOCALE_FRFR, "FRFR" },
        { CASC_LOCALE_DEDE, "DEDE" },
        { CASC_LOCALE_ZHCN, "ZHCN" },
        { CASC_LOCALE_ESES, "ESES" },
        { CASC_LOCALE_ZHTW, "ZHTW" },
        { CASC_LOCALE_ENGB, "ENGB" },
        { CASC_LOCALE_ENCN, "ENCN" },
        { CASC_LOCALE_ENTW, "ENTW" },
        { CASC_LOCALE_ESMX, "ESMX" },
        { CASC_LOCALE_RURU, "RURU" },
        { CASC_LOCALE_PTBR, "PTBR" },
        { CASC_LOCALE_ITIT, "ITIT" },
        { CASC_LOCALE_PTPT, "PTPT" }
    };

    void Init(Napi::Env env, Napi::Object exports);
}
