-- up
CREATE TABLE infokes.nodes (
    id UUID PRIMARY KEY DEFAULT uuidv7(), 
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) CHECK (type IN ('folder', 'file')) NOT NULL, 
    
    parent_id UUID REFERENCES infokes.nodes(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES infokes.users(id) ON DELETE CASCADE,
    
    file_size_bytes BIGINT DEFAULT 0,
    mime_type VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_file_cannot_have_children CHECK (
        (type = 'file' AND parent_id IS NOT NULL) OR type = 'folder' OR parent_id IS NULL
    )
);

CREATE INDEX idx_nodes_directory_listing ON infokes.nodes (parent_id, type DESC, name ASC);

-- down
DROP INDEX IF EXISTS infokes.idx_nodes_directory_listing;
DROP TABLE IF EXISTS infokes.nodes CASCADE;