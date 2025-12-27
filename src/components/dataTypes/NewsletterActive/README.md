# Newsletter Active Component

Boolean field component for Pimcore newsletter subscription status.

## Quick Start

```tsx
import { NewsletterActiveEdit } from './NewsletterActive';

<NewsletterActiveEdit
  value={true}
  onChange={(value) => console.log('New value:', value)}
  config={{ label: 'Newsletter Active', mandatory: true }}
/>
```

## Components

- **NewsletterActiveDisplay** - Read-only display
- **NewsletterActiveEdit** - Interactive switch control

## Features

- ✅ Mobile-optimized switch control
- ✅ Validation support
- ✅ Read-only mode
- ✅ Error handling
- ✅ Platform-adaptive styling (iOS/Android)

## Documentation

See [NEWSLETTER_ACTIVE_DATA_TYPE.md](../../../docs/NEWSLETTER_ACTIVE_DATA_TYPE.md) for complete documentation.

## Tests

```bash
npm test -- NewsletterActive.test.tsx
```
