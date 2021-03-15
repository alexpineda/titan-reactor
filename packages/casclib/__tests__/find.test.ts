import "jest"
import * as storage from "../lib/storage"
import * as find from "../lib/find"

const testData = require("../test-data.json")

test("findFilesSync", () => {
  const storageHandle = storage.openStorageSync(testData.storageLocation)
  const results = find.findFilesSync(storageHandle, testData.searchPattern)

  expect(results).toHaveLength(1);
  const result = results[0]
  expect(result).toHaveProperty("baseName")
  expect(result).toHaveProperty("fileSize")
  expect(result).toHaveProperty("fullName", testData.searchPattern)

  storage.closeStorage(storageHandle)
})

test("findFilesSync should return an empty array when no files are found", () => {
  const storageHandle = storage.openStorageSync(testData.storageLocation)
  const results = find.findFilesSync(storageHandle, "find_nothing")

  expect(results).toHaveLength(0);

  storage.closeStorage(storageHandle)
})

describe("findFiles", () => {
  describe("with callback", () => {
    test("list file path in arguments", done => {
      storage.openStorage(testData.storageLocation, (error, storageHandle) => {
        if(error) {
          done.fail(error)
        }

        find.findFiles(storageHandle, testData.searchPattern, "", (error, results) => {
          if(error) {
            done.fail(error)
          }

          expect(results).toHaveLength(1);
          const result = results[0]
          expect(result).toHaveProperty("baseName")
          expect(result).toHaveProperty("fileSize")
          expect(result).toHaveProperty("fullName", testData.searchPattern)

          storage.closeStorage(storageHandle)
          done()
        })
      })
    })

    test("without list file path in arguments", done => {
      storage.openStorage(testData.storageLocation, (error, storageHandle) => {
        if(error) {
          done.fail(error)
        }

        find.findFiles(storageHandle, testData.searchPattern, (error, results) => {
          if(error) {
            done.fail(error)
          }

          expect(results).toHaveLength(1);
          const result = results[0]
          expect(result).toHaveProperty("baseName")
          expect(result).toHaveProperty("fileSize")
          expect(result).toHaveProperty("fullName", testData.searchPattern)

          storage.closeStorage(storageHandle)
          done()
        })
      })
    })

    test("returns an empty array when no files are found", done => {
      storage.openStorage(testData.storageLocation, (error, storageHandle) => {
        if(error) {
          done.fail(error)
        }

        find.findFiles(storageHandle, "find_nothing", (error, results) => {
          if(error) {
            done.fail(error)
          }

          expect(results).toHaveLength(0);

          storage.closeStorage(storageHandle)
          done()
        })
      })
    })
  })

  describe("without callback", () => {
    test("list file path in arguments", () => {
      return storage.openStorage(testData.storageLocation)
        .then(storageHandle => {
          return find.findFiles(storageHandle, testData.searchPattern, "")
            .then((results) => {
              expect(results).toHaveLength(1);
              const result = results[0]
              expect(result).toHaveProperty("baseName")
              expect(result).toHaveProperty("fileSize")
              expect(result).toHaveProperty("fullName", testData.searchPattern)

              storage.closeStorage(storageHandle)
            })
        })
    })

    test("without list file path in arguments", () => {
      return storage.openStorage(testData.storageLocation)
      .then(storageHandle => {
        return find.findFiles(storageHandle, testData.searchPattern)
          .then(results => {
            expect(results).toHaveLength(1);
            const result = results[0]
            expect(result).toHaveProperty("baseName")
            expect(result).toHaveProperty("fileSize")
            expect(result).toHaveProperty("fullName", testData.searchPattern)

            storage.closeStorage(storageHandle)
          })
      })
    })

    test("returns an empty array when no files are found", () => {
      return storage.openStorage(testData.storageLocation)
        .then(storageHandle => {
          return find.findFiles(storageHandle, "find_nothing")
            .then((results) => {
              expect(results).toHaveLength(0);

              storage.closeStorage(storageHandle)
            })
        })
    })
  })
})
