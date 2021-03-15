{
    'targets': [
        {
            'target_name': 'casclib-native',
            'sources': [
                'src/errors.cc',
                'src/locales.cc',
                'src/storageinfo.cc',
                'src/storage.cc',
                'src/find.cc',
                'src/openfile.cc',
                'src/readfile.cc',
                'src/casclib.cc',
            ],
            'include_dirs': [
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'dependencies': [
                "<!(node -p \"require('node-addon-api').gyp\")",
                "CascLibRAS"
            ],
            'cflags!': [ '-fno-exceptions' ],
            'cflags_cc!': [ '-fno-exceptions' ],
            'xcode_settings': {
                'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
                'CLANG_CXX_LIBRARY': 'libc++',
                'MACOSX_DEPLOYMENT_TARGET': '10.7'
            },
            'msvs_settings': {
                'VCCLCompilerTool': {
                    'ExceptionHandling': 1,
                },
            }
        },
        {
            'target_name': "CascLibRAS",
            'type': 'static_library',
            'include_dirs': [
                "CascLib/src/",
            ],
            'sources': [
                'CascLib/src/zlib/adler32.c',
                'CascLib/src/zlib/crc32.c',
                'CascLib/src/zlib/inffast.c',
                'CascLib/src/zlib/inflate.c',
                'CascLib/src/zlib/inftrees.c',
                'CascLib/src/zlib/zutil.c',
                'CascLib/src/libtomcrypt/src/hashes/hash_memory.c',
                'CascLib/src/libtomcrypt/src/hashes/md5.c',
                'CascLib/src/libtomcrypt/src/misc/crypt_argchk.c',
                'CascLib/src/libtomcrypt/src/misc/crypt_hash_descriptor.c',
                'CascLib/src/libtomcrypt/src/misc/crypt_hash_is_valid.c',
                'CascLib/src/libtomcrypt/src/misc/crypt_libc.c',
                'CascLib/src/common/Array.cpp',
                'CascLib/src/common/Common.cpp',
                'CascLib/src/common/Directory.cpp',
                'CascLib/src/common/DumpContext.cpp',
                'CascLib/src/common/FileStream.cpp',
                'CascLib/src/common/FileTree.cpp',
                'CascLib/src/common/ListFile.cpp',
                'CascLib/src/common/Map.cpp',
                'CascLib/src/common/RootHandler.cpp',
                'CascLib/src/jenkins/lookup3.c',
                'CascLib/src/CascCommon.cpp',
                'CascLib/src/CascDecompress.cpp',
                'CascLib/src/CascDecrypt.cpp',
                'CascLib/src/CascDumpData.cpp',
                'CascLib/src/CascFiles.cpp',
                'CascLib/src/CascFindFile.cpp',
                'CascLib/src/CascOpenFile.cpp',
                'CascLib/src/CascOpenStorage.cpp',
                'CascLib/src/CascReadFile.cpp',
                'CascLib/src/CascRootFile_Text.cpp',
                'CascLib/src/CascRootFile_TVFS.cpp',
                'CascLib/src/CascRootFile_Diablo3.cpp',
                'CascLib/src/CascRootFile_Mndx.cpp',
                'CascLib/src/CascRootFile_WoW6.cpp',
            ],
            'direct_dependent_settings': {
                'include_dirs': [
                    "CascLib/src",
                ]
            }
        },
  ]
}
