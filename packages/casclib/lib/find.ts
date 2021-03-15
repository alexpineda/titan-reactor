const addon = require('../build/Release/casclib-native')

export interface FindResult {
  fullName: string
  baseName: string
  fileSize: number
}

export type FindFilesCallback = (error: Error, results: FindResult[]) => void

export function findFilesSync(storageHandle: any, searchPattern: string = "*", listFilePath: string = ''): FindResult[] {
  return addon.findCascFilesSync(storageHandle, searchPattern, listFilePath)
}

export function findFiles(storageHandle: any, searchPattern: string): Promise<FindResult[]>
export function findFiles(storageHandle: any, searchPattern: string, listFilePath: string): Promise<FindResult[]>
export function findFiles(storageHandle: any, searchpattern: string, callback: FindFilesCallback): null
export function findFiles(storageHandle: any, searchpattern: string, listFilePath: string, callback: FindFilesCallback): null
export function findFiles(
  storageHandle: any,
  searchPattern: string,
  listFilePathOrCallback: string | FindFilesCallback = '',
  callback?: (error: Error, results: FindResult[]) => void
): null | Promise<FindResult[]> {
  let listFilePath = listFilePathOrCallback
  if(typeof listFilePathOrCallback !== 'string') {
    listFilePath = ''
    callback = listFilePathOrCallback
  }

  return addon.findCascFiles(storageHandle, searchPattern, listFilePath, callback)
}
