# KIPSMTHN Creative Platform - shadcn/ui Design System

## Overview

As requested, all UI and styling across the platform is adapted from **shadcn/ui** ([github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) and [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components)). shadcn/ui is the single source of truth for the platform's UI architecture, component patterns, and theming.

## Theming & Tokens

The theme uses the modern Zinc / Neutral base palette configured with CSS custom variables in `src/app/globals.css` and Tailwind CSS v4.

### Design Tokens

All colors are exposed through CSS custom variables and theme inline mappings:

- `--background`: Page background (`oklch(1 0 0)` in light mode, `oklch(0.145 0 0)` in dark mode)
- `--foreground`: Text foreground (`oklch(0.145 0 0)` in light mode, `oklch(0.985 0 0)` in dark mode)
- `--card` / `--card-foreground`: Card background and foreground
- `--popover` / `--popover-foreground`: Popovers, dropdowns, tooltips
- `--primary` / `--primary-foreground`: Primary action color
- `--secondary` / `--secondary-foreground`: Secondary buttons and accents
- `--muted` / `--muted-foreground`: Subdued backgrounds and helper text
- `--accent` / `--accent-foreground`: Interactive hovered surfaces
- `--destructive` / `--destructive-foreground`: Destructive buttons, error alerts
- `--border`: Standard 1px borders
- `--input`: Form control borders
- `--ring`: Focus rings
- `--radius`: Base border radius (`0.625rem`)

### Dark Mode

Dark mode is activated via the `.dark` class on the `<html>` element, toggled dynamically with `ThemeToggle.tsx`.

## Component Library (`src/components/ui/`)

All components conform to the official shadcn/ui specifications:

### Core Primitives

| Component | Path | Source of Truth |
| :--- | :--- | :--- |
| **Button** | `src/components/ui/Button.tsx` | [ui.shadcn.com/docs/components/button](https://ui.shadcn.com/docs/components/button) |
| **Card** | `src/components/ui/Card.tsx` | [ui.shadcn.com/docs/components/card](https://ui.shadcn.com/docs/components/card) |
| **Badge** | `src/components/ui/Badge.tsx` | [ui.shadcn.com/docs/components/badge](https://ui.shadcn.com/docs/components/badge) |
| **Input** | `src/components/ui/Input.tsx` | [ui.shadcn.com/docs/components/input](https://ui.shadcn.com/docs/components/input) |
| **Textarea** | `src/components/ui/Textarea.tsx` | [ui.shadcn.com/docs/components/textarea](https://ui.shadcn.com/docs/components/textarea) |
| **Label** | `src/components/ui/Label.tsx` | [ui.shadcn.com/docs/components/label](https://ui.shadcn.com/docs/components/label) |
| **Dialog** | `src/components/ui/Dialog.tsx` | [ui.shadcn.com/docs/components/dialog](https://ui.shadcn.com/docs/components/dialog) |
| **DropdownMenu** | `src/components/ui/DropdownMenu.tsx` | [ui.shadcn.com/docs/components/dropdown-menu](https://ui.shadcn.com/docs/components/dropdown-menu) |
| **Tabs** | `src/components/ui/Tabs.tsx` | [ui.shadcn.com/docs/components/tabs](https://ui.shadcn.com/docs/components/tabs) |
| **Separator** | `src/components/ui/Separator.tsx` | [ui.shadcn.com/docs/components/separator](https://ui.shadcn.com/docs/components/separator) |
| **Table** | `src/components/ui/Table.tsx` | [ui.shadcn.com/docs/components/table](https://ui.shadcn.com/docs/components/table) |
| **Avatar** | `src/components/ui/Avatar.tsx` | [ui.shadcn.com/docs/components/avatar](https://ui.shadcn.com/docs/components/avatar) |
| **Select** | `src/components/ui/Select.tsx` | [ui.shadcn.com/docs/components/select](https://ui.shadcn.com/docs/components/select) |
| **Sheet** | `src/components/ui/Sheet.tsx` | [ui.shadcn.com/docs/components/sheet](https://ui.shadcn.com/docs/components/sheet) |
| **Alert** | `src/components/ui/Alert.tsx` | [ui.shadcn.com/docs/components/alert](https://ui.shadcn.com/docs/components/alert) |
| **Skeleton** | `src/components/ui/Skeleton.tsx` | [ui.shadcn.com/docs/components/skeleton](https://ui.shadcn.com/docs/components/skeleton) |

### Usage Examples

#### Button
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

<Card>
  <CardHeader>
    <CardTitle>Studio Performance</CardTitle>
    <CardDescription>Monthly overview of production metrics</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>
```

#### Dialog & Sheet
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
    </DialogHeader>
    <p>Modal content</p>
  </DialogContent>
</Dialog>
```
