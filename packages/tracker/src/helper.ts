import type {TorrentFileListContainer, TorrentFileListFlatten} from './types.ts'

export const fileListFlatten = (nodes: TorrentFileListContainer, path = ''): TorrentFileListFlatten => {
  return Array.from(nodes, (node) => {
    const currentPath = path ? `${path}/${node.name}` : node.name
    if (node.type === 'folder') {
      return fileListFlatten(node.children, currentPath)
    } else {
      return {
        path: currentPath,
        name: node.name,
        size: node.size,
      } as const
    }
  }).flat()
}
