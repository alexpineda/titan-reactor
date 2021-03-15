node-casclib
============

Node bindings for [CascLib](https://github.com/ladislav-zezula/CascLib)

Installation
------------

node-casclib has been tested on Windows and Linux. To install using npm

    npm install casclib

or with yarn

    yarn add casclib


Usage
-----------

Reading a file synchronously.

    import * as casclib from 'casclib'

    const storageHandle = casclib.openStorageSync("path/to/game/directory")

    const fileData = casclib.readFile("path/to/casc/file")

    casclib.closeStorage(storageHandle)


Read a file asynchronously with promises.

    import * as casclib from 'casclib'

    casclib.openStorage("path/to/game/directory")
      .then(storageHandle => {
        return casclib.readfile("path/to/casc/file")
          .then(fileData => {
            // do things with file data

            casclibe.closeStorage(storageHandle)
          })
      })

Read a file asynchronously with callbacks.

    import * as casclib from 'casclib'

    casclib.openStorage("path/to/game/directory", (error, storageHandle) => {
      if(error) {
        // handle error
      }

      casclib.readFile("path/to/casc/file", (error, fileData) => {
        if(error) {
          // handle error
        }

        // do things with file data

        casclib.closeStorage(storageHandle)
      })
    })


API
-----------

### CASC Storage and storage info

##### Game Names
Possible game name values.

- Heroes of the Storm
- World of Warcraft
- Diablo 3
- Overwatch
- Starcraft
- Starcraft II
- Unknown

##### Locales
Supported locale values

- ALL
- NONE
- UNKNOWN1
- ENUS
- KOKR
- RESERVED
- FRFR
- DEDE
- ZHCN
- ESES
- ZHTW
- ENGB
- ENCN
- ENTW
- ESMX
- RURU
- PTBR
- ITIT
- PTPT

##### StorageInfo
Object returned by `getStorageInfo`

- `fileCount` number of files
- `gameName` name of game
- `gameBuild` game build number
- `installedLocales` array of installed locale names

##### OpenStorageCallback
Callback signature used by `openStorage`

    (error: Error, storageHandle: any) => void


#### openStorageSync
Synchronously open CASC storage at path

    openStorageSync(path: string, locales: string[] = [ 'ALL' ]): any

- `path` Path to location of CASC storage
- `locales` (defaults to `[ 'ALL' ]`) Array of `string`s of valid locales to open
- returns a handle for the specified CASC storage

#### openStorage
Asynchronously open CASC storage for path and locales

    openStorage(path: string): Promise<any>
    openStorage(path: string, locales: string[]): Promise<any>
    openStorage(path: string, callback: OpenStorageCallback): null
    openStorage(path: string, locales: string[], callback: OpenStorageCallback): null

- `path` Path to location of CASC storage
- `locales` (defaults to `[ 'ALL' ]`) Array of `string`s of valid locales to open
- `callback` (optional) Called after CASC storage has been opened
- returns `Promise` if `callback` is not provided otherwise returns `null`

#### getStorageInfo
Get information about the opened CASC storage

    getStorageInfo(storageHandle: any): StorageInfo

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- returns a `StorageInfo` object

#### closeStorage
Close CASC storage

    closeStorage(storageHandle: any): void

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`


### Find files

#### FindResult
Object returned by `findFiles` and `findFilesSync`

- `fullName` full path of file
- `baseName` file name
- `fileSize` size of file

#### findFilesSync
Synchronously search CASC storage for files that match the search pattern.

    findFilesSync(storageHandle: any, searchPattern: string = "\*", listFilePath: string = ''): FindResult[]

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- `searchPattern` (defaults to "\*") Can use `*` to match any number of characters in the file path or `?` to match a single character.
- `listFilePath` (defaults to an empty string) path to file containing list of files in the CASC storage (only required for WOW)
- returns list of `FindResult`s

#### findFiles

Asynchronously search CASC storage for files that match the search pattern.

    findFiles(storageHandle: any, searchPattern: string): Promise<FindResult[]>
    findFiles(storageHandle: any, searchPattern: string, listFilePath: string): Promise<FindResult[]>
    findFiles(storageHandle: any, searchpattern: string, callback: FindFilesCallback): null

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- `searchPattern` (defaults to "\*") Can use `*` to match any number of characters in the file path or `?` to match a single character.
- `listFilePath` (defaults to an empty string) path to file containing list of files in the CASC storage (only required for WOW)
- returns `Promise` if `callback` is not provided otherwise returns `null`

### Open and Read files in CASC storage

##### OpenFileCallback
Callback signature used by `openFile`.

    (error: Error, fileHandle: any) => void

##### ReadFileCallback
Callback signature used by `read` and `readFile`.

    (error: Error, fileData: Buffer) => void

#### openFileSync

Synchronously open CASC file.

    openFileSync(storageHandle: any, filePath: string)

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- `filePath` CASC file path for file to open
- returns handle for opened file

#### openFile

Asynchronously open CASC file.

    openFile(storageHandle: any, filePath: string): Promise<any>
    openFile(storageHandle: any, filePath: string, callback: OpenFileCallback): null

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- `filePath` CASC file path for file to open
- `callback` (optional) called after file has been opened
- returns `Promise` if `callback` is not provided otherwise returns `null`

#### readSync

Synchronously read a file in CASC storage.

    readSync(fileHandle: any): Buffer

- `fileHandle` handle for file to be read
- returns `Buffer` with file contents

#### read

Asynchronously read a file in CASC storage.

    read(fileHandle: any): Promise<Buffer>
    read(fileHandle: any, callback: ReadFileCallback): null

- `fileHandle` handle for file to be read
- returns `Promise` if `callback` is not provided otherwise returns `null`

#### readFileSync

Synchronously read a file in CASC storage.

    readFileSync(storageHandle: any, filePath: string): Buffer

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- `filePath` CASC file path for file to open
- returns `Buffer` with file contents

#### readFile

Asynchronously read a file in CASC storage.

    readFile(storageHandle: any, filePath: string): Promise<Buffer>
    readFile(storageHandle: any, filePath: string, callback: ReadFileCallback): null

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- `filePath` CASC file path for file to read
- `callback` (optional) called after file has been opened and read
- returns `Promise` if `callback` is not provided otherwise returns `null`

#### closeFile

Close CASC file

    closeFile(fileHandle: any): void

- `storageHandle` handle returned by either `openStorageSync` or `openStorage`

#### FileReadable

Readable Stream object used to read files in CASC storage.

- `path` path to the file in CASC storage
- `storageHandle` handle for CASC storage
- `fileHandle` handle for CASC file. If provided `path` and `storageHandle` are not required.


#### createReadStream

Creates a FileReadable.

    createReadStream(fileHandle: any, options?: ReadableOptions): Readable
    createReadStream(storageHandle: any, filePath: string, options?: ReadableOptions): Readable

- `fileHandle` handle for file to be read
- `storageHandle` handle returned by either `openStorageSync` or `openStorage`
- `filePath` - `filePath` CASC file path for file to read
- `options` (optional) stream options see nodejs stream docs for supported options.
- returns a `FileReadable`
