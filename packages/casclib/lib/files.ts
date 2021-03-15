const addon = require('../build/Release/casclib-native')

import { Readable, ReadableOptions } from 'stream'

export type OpenFileCallback = (error: Error, fileHandle: any) => void
export type ReadFileCallback = (error: Error, fileData: Buffer) => void

export function openFileSync(storageHandle: any, filePath: string) {
  return addon.openCascFileSync(storageHandle, filePath)
}

export function openFile(storageHandle: any, filePath: string): Promise<any>
export function openFile(storageHandle: any, filePath: string, callback: OpenFileCallback): null
export function openFile(storageHandle: any, filePath: string, callback?: OpenFileCallback): null | Promise<any> {
  return addon.openCascFile(storageHandle, filePath, callback)
}

export function readSync(fileHandle: any): Buffer {
  return addon.cascReadSync(fileHandle)
}

export function read(fileHandle: any): Promise<Buffer>
export function read(fileHandle: any, callback: ReadFileCallback): null
export function read(fileHandle: any, callback?: ReadFileCallback): null | Promise<Buffer> {
  return addon.cascRead(fileHandle, callback)
}

export function readFileSync(storageHandle: any, filePath: string): Buffer {
  const fileHandle = openFileSync(storageHandle, filePath)
  const fileData = readSync(fileHandle)
  closeFile(fileHandle)

  return fileData
}

export function readFile(storageHandle: any, filePath: string): Promise<Buffer>
export function readFile(storageHandle: any, filePath: string, callback: ReadFileCallback): null
export function readFile(storageHandle: any, filePath: string, callback?: ReadFileCallback): null | Promise<Buffer> {
  if(callback) {
    openFile(storageHandle, filePath, (error: Error, fileHandle: any) => {
      if(error) {
        throw error
      }

      read(fileHandle, (error, fileData) => {
        closeFile(fileHandle)
        callback(error, fileData)
      })
    })
    return null
  }

  return openFile(storageHandle, filePath)
    .then(fileHandle => {
      return read(fileHandle)
        .then(fileData => {
          closeFile(fileHandle)

          return fileData
        })
    })
}

export class FileReadable extends Readable {
  path: string | undefined
  storageHandle: any
  fileHandle: any

  constructor(options: ReadableOptions) {
    super(options)
  }

  _read(size: number) {
    if(!this.fileHandle) {
      this.openFile(() => this.getData(size))
    }
    else {
      this.getData(size)
    }
  }

  _destroy(error: Error, callback: (error?: Error) => void) {
    if(this.storageHandle && this.path && this.storageHandle) {
      try {
        this.closeFile()
        callback(error)
      }
      catch(e) {
        callback(e)
      }
    }
  }

  private openFile(callback: () => void) {
    if(!this.path) {
      this.error(new Error("'fileHandle' or 'storageHandle' and 'path' must be provided."))
      return
    }

    openFile(this.storageHandle, this.path, (error: Error, fileHandle: any) => {
      if(error) {
        this.error(error)
        return
      }

      this.fileHandle = fileHandle
      callback()
    })
  }

  private closeFile() {
    if(this.storageHandle && this.path && this.fileHandle) {
      closeFile(this.fileHandle)
      this.fileHandle = null
    }
  }

  private getData(size: number) {
    addon.readCascFileBuffer(this.fileHandle, size, (error: Error, buffer: Buffer) => {
      if(error) {
        this.error(error)
        return
      }

      if(buffer.length === 0) {
        this.closeFile()
        this.push(null)
      }
      else {
        this.push(buffer)
      }
    })
  }

  private error(error: Error) {
    process.nextTick(() => this.emit('error', error));
    return;
  }
}

export function createReadStream(fileHandle: any, options?: ReadableOptions): Readable
export function createReadStream(storageHandle: any, filePath: string, options?: ReadableOptions): Readable
export function createReadStream(handle: any, filePathOrOptions?: string | ReadableOptions, options?: ReadableOptions): Readable {
  const path = typeof filePathOrOptions === 'string' ? filePathOrOptions : undefined
  options = typeof filePathOrOptions !== 'string' ? filePathOrOptions : options
  const readable = new FileReadable(options || {})
  readable.path = path
  if(path) {
    readable.storageHandle = handle
  }
  else {
    readable.fileHandle = handle
  }

  return readable
}

export function closeFile(fileHandle: any) {
  addon.closeCascFile(fileHandle)
}
