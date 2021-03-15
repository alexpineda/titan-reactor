import "jest"
import * as storage from "../lib/storage"
import * as files from "../lib/files"

const testData = require("../test-data.json")

function testBuffer(buffer: Buffer) {
  expect(buffer).toBeInstanceOf(Buffer)

  const str = buffer.toString("utf8")

  testData.fileExpectations.forEach(expectation => {
    expect(str).toEqual(expect.stringContaining(expectation))
  })
}

test("openFileSync", () => {
  const storageHandle = storage.openStorageSync(testData.storageLocation)
  const fileHandle = files.openFileSync(storageHandle, testData.cascFilePath)

  expect(fileHandle).toBeDefined()

  files.closeFile(fileHandle)
  storage.closeStorage(storageHandle)
})

describe("openFile", () => {
  test("with callback", done => {
    storage.openStorage(testData.storageLocation, (error, storageHandle) => {
      if(error) {
        done.fail(error)
      }

      files.openFile(storageHandle, testData.cascFilePath, (error, fileHandle) => {
        if(error) {
          done.fail(error)
        }

        expect(fileHandle).toBeDefined()

        files.closeFile(fileHandle)
        storage.closeStorage(storageHandle)
        done()
      })
    })
  })

  test("without callback", () => {
    return storage.openStorage(testData.storageLocation)
      .then(storageHandle => {
        return files.openFile(storageHandle, testData.cascFilePath)
          .then(fileHandle => {
            expect(fileHandle).toBeDefined()
            files.closeFile(fileHandle)
            storage.closeStorage(storageHandle)
          })
      })
  })
})

test("readSync", () => {
  const storageHandle = storage.openStorageSync(testData.storageLocation)
  const fileHandle = files.openFileSync(storageHandle, testData.cascFilePath)

  const fileBuffer = files.readSync(fileHandle)

  testBuffer(fileBuffer)

  files.closeFile(fileHandle)
  storage.closeStorage(storageHandle)
})

describe("read", () => {
  test("with callback", done => {
    storage.openStorage(testData.storageLocation, (error, storageHandle) => {
      if(error) {
        done.fail(error)
      }

      files.openFile(storageHandle, testData.cascFilePath, (error, fileHandle) => {
        if(error) {
          done.fail(error)
        }

        files.read(fileHandle, (error, buffer) => {
          if(error) {
            done.fail(error)
          }

          testBuffer(buffer)
          files.closeFile(fileHandle)
          storage.closeStorage(storageHandle)
          done()
        })
      })
    })
  })

  test("without callback", () => {
    return storage.openStorage(testData.storageLocation)
      .then(storageHandle => {
        return files.openFile(storageHandle, testData.cascFilePath)
          .then(fileHandle => {
            return files.read(fileHandle)
              .then(buffer => {
                testBuffer(buffer)

                files.closeFile(fileHandle)
                storage.closeStorage(storageHandle)
              })
          })
      })
  })
})

test("readFileSync", () => {
  const storageHandle = storage.openStorageSync(testData.storageLocation)
  const fileBuffer = files.readFileSync(storageHandle, testData.cascFilePath)

  testBuffer(fileBuffer)

  storage.closeStorage(storageHandle)
})

describe("readFile", () => {
  test("with callback", done => {
    storage.openStorage(testData.storageLocation, (error, storageHandle) => {
      if(error) {
        done.fail(error)
      }

      files.readFile(storageHandle, testData.cascFilePath, (error, buffer) => {
        if(error) {
          done.fail(error)
        }

        testBuffer(buffer)

        storage.closeStorage(storageHandle)
        done()
      })
    })
  })

  test("without callback", () => {
    return storage.openStorage(testData.storageLocation)
      .then(storageHandle => {
        return files.readFile(storageHandle, testData.cascFilePath)
          .then(buffer => {
            testBuffer(buffer)

            storage.closeStorage(storageHandle)
          })
      })
  })
})

describe("FileReadable", () => {
  let storageHandle: any
  let readable: files.FileReadable

  beforeAll(() => {
    storageHandle = storage.openStorageSync(testData.storageLocation)
  })

  afterAll(() => {
    storage.closeStorage(storageHandle)
  })

  beforeEach(() => {
    readable = new files.FileReadable({ encoding: "utf8" })
  })

  test("reads file with fileHandle provided", done => {
    files.openFile(storageHandle, testData.cascFilePath, (error, fileHandle) => {
      if(error) {
        done.fail(error)
      }

      readable.fileHandle = fileHandle

      readable.on('error', error => {
        done.fail(error)
      })


      readable.on("readable", () => {
        let text = readable.read(testData.fileReadTest1.length)
        expect(text).toHaveLength(testData.fileReadTest1.length)
        expect(text).toEqual(testData.fileReadTest1)

        text = readable.read(testData.fileReadTest2.length)
        expect(text).toHaveLength(testData.fileReadTest2.length)
        expect(text).toEqual(testData.fileReadTest2)

        done()
      })
    })
  })

  test("reads file with storageHandle and path provided", done => {
    readable.storageHandle = storageHandle
    readable.path = testData.cascFilePath

    readable.on('error', error => {
      done.fail(error)
    })

    readable.on("readable", () => {
      let text = readable.read(testData.fileReadTest1.length)
      expect(text).toHaveLength(testData.fileReadTest1.length)
      expect(text).toEqual(testData.fileReadTest1)

      text = readable.read(testData.fileReadTest2.length)
      expect(text).toHaveLength(testData.fileReadTest2.length)
      expect(text).toEqual(testData.fileReadTest2)

      done()
    })
  })

  test("reads file should end stream when the entire file has been read", done => {
    readable.storageHandle = storageHandle
    readable.path = testData.cascFilePath

    readable.on('error', error => {
      done.fail(error)
    })

    readable.on('end', () => {
      done()
    })

    readable.resume()
  })

  test("reads file should throw error if fileHandle is undefined and path is not provided", done => {
    readable.on('error', error => {
      done()
    })

    readable.on('readable', () => {
      readable.read(10)
    })
  })
})

describe("createReadStream", () => {
  let storageHandle: any
  beforeAll(() => {
    storageHandle = storage.openStorageSync(testData.storageLocation)
  })

  afterAll(() => {
    storage.closeStorage(storageHandle)
  })

  test("creates readable with fileHandle set when only fileHandle is provided", () => {
    const fileHandle = files.openFileSync(storageHandle, testData.cascFilePath)

    const readable = files.createReadStream(fileHandle) as files.FileReadable
    expect(readable.fileHandle).toEqual(fileHandle)
  })

  test("creates readable with fileHandle set when fileHandle and options are provided", () => {
    const fileHandle = files.openFileSync(storageHandle, testData.cascFilePath)

    const readable = files.createReadStream(fileHandle, {}) as files.FileReadable
    expect(readable.fileHandle).toEqual(fileHandle)
  })

  test("creates readable with storageHandle and path set when storageHandle and path are provided", () => {
    const readable = files.createReadStream(storageHandle, testData.cascFilePath) as files.FileReadable

    expect(readable.storageHandle).toEqual(storageHandle)
    expect(readable.path).toEqual(testData.cascFilePath)
  })

  test("creates readable with storageHandle and path set when storageHandle, path and options are provided", () => {
    const readable = files.createReadStream(storageHandle, testData.cascFilePath, {}) as files.FileReadable

    expect(readable.storageHandle).toEqual(storageHandle)
    expect(readable.path).toEqual(testData.cascFilePath)
  })
})
