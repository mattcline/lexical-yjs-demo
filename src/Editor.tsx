import { useCallback } from 'react';

import {$getRoot, $createParagraphNode, $createTextNode} from 'lexical';
import {LexicalCollaboration} from '@lexical/react/LexicalCollaborationContext';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import * as Y from 'yjs';
import {WebsocketProvider} from 'y-websocket';

export function Editor() {
  const initialConfig = {
    // NOTE: This is critical for collaboration plugin to set editor state to null. It
    // would indicate that the editor should not try to set any default state
    // (not even empty one), and let collaboration plugin do it instead
    editorState: null,
    namespace: 'Demo',
    nodes: [],
    onError: (error: Error) => {
      throw error;
    },
    theme: {},
  };

  function getDocFromMap(id: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {
    let doc = yjsDocMap.get(id);
  
    if (doc === undefined) {
      doc = new Y.Doc();
      yjsDocMap.set(id, doc);
    } else {
      doc.load();
    }

    return doc;
  }

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const doc = getDocFromMap(id, yjsDocMap);

      return new WebsocketProvider('ws://localhost:1234', id, doc, {
        connect: false,
      });
    }, [],
  );

  return (
    <LexicalCollaboration>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable style={{width: '800px', height: '800px'}} />}
          placeholder={<div className="editor-placeholder">Enter some rich text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <CollaborationPlugin
          id="lexical/react-rich-collab"
          providerFactory={providerFactory}
        />
      </LexicalComposer>
    </LexicalCollaboration>
  );
}