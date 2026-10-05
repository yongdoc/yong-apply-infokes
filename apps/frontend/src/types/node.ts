export interface Node {
  id: string
  name: string
  type: 'folder' | 'file'
  parent_id: string | null
  file_size_bytes?: number
  mime_type?: string | null
  created_at?: string
  updated_at?: string
  children?: Node[]
}
