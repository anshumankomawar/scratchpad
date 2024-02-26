import React from 'react';

import {SortableTree} from './SortableTree';
import { saveDocument, useDocuments } from "@/fetch/documents";

export default {
  title: 'Examples/Tree/Sortable',
};

const Wrapper = ({children}: {children: React.ReactNode}) => (
  <div
    style={{
      maxWidth: 600,
      padding: 10,
      margin: '0 auto',
      marginTop: '10%',
    }}
  >
    {children}
  </div>
);

export const AllFeatures = () => {
  const documents = useDocuments();

  const folderItems = Object.entries(documents.data).map(([folderName, files]) => ({
    id: folderName,
    children: files.map(file => ({
      id: file.filename,
      children: [] 
    }))
  }));
  
  if(folderItems.length === 0) {
    return <div></div>
  } else {
    return(
      <Wrapper>
        <SortableTree defaultItems={folderItems} collapsible indicator removable />
      </Wrapper>

    )
  }
};

export const BasicSetup = () => (
  <Wrapper>
    <SortableTree />
  </Wrapper>
);

export const DropIndicator = () => (
  <Wrapper>
    <SortableTree indicator />
  </Wrapper>
);

export const Collapsible = () => (
  <Wrapper>
    <SortableTree collapsible />
  </Wrapper>
);

export const RemovableItems = () => (
  <Wrapper>
    <SortableTree removable />
  </Wrapper>
);
