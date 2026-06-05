export type TorrentFsFile = {
  type: 'file'
  name: string
  size: number | null
}
export type TorrentFsFolder = {
  type: 'folder'
  name: string
  children: TorrentFileListContainer
}
export type TorrentFileListContainer = Array<TorrentFsFile | TorrentFsFolder>

export type TorrentFileListFlatten = Array<{path: string; name: string; size: number | null}>

// class FileList {
//   constructor() {}

//   isFolder(): this is {type: 'folder'} {
//     return true
//   }
//   isFile() {}
// }

// const fileList = new FileList()
// if (fileList.isFolder()) {
//   fileList.type
// }
