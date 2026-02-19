import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: "'Source Sans 3', sans-serif",
    body: "'Source Sans 3', sans-serif",
  },
  styles: {
    global: {
      body: {
        fontFamily: "'Source Sans 3', sans-serif",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '800',
      },
    },
  },
});

export default theme;
