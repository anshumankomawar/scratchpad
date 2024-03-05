import { FC, ReactNode } from 'react';
import { useDroppable, UniqueIdentifier } from '@dnd-kit/core';

export const DropZone: FC<{ children: ReactNode, id: UniqueIdentifier }> = ({ children, id }) => {
  const { setNodeRef } = useDroppable({ id })

  const style = {
    listStyleType: 'none',
  };

  return (
    <li ref={setNodeRef} style={style}>
      {children}
    </li>
  );
}