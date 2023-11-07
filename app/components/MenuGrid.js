import React, { useMemo, Children, isValidElement } from 'react';
import { SimpleGrid } from '@/providers';

export default function MenuGrid(props) {
  const columns = useMemo(() => {
    // different grid dimensions on different screens
    return {
      base: props.col ? Math.min(2, props.col) : 2,
      md: props.col ? Math.min(3, props.col) : 3,
      lg: props.col ? Math.min(4, props.col) : 4,
      xl: props.col ? Math.min(5, props.col) : 5,
    };
  }, [props.children]);

  return (
    <SimpleGrid
      columns={columns}
      columnGap={{ base: '4', md: '6' }}
      rowGap={{ base: '8', md: '10' }}
      px={4}
      my={8}
      {...props}
    />
  );
};