import sys

with open('src/app/admin/calendar/page.tsx', 'r') as f:
    lines = f.readlines()

# We'll process line by line, but we need to handle multi-line blocks.
# We'll use a simple state machine.

output = []
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()

    # Day container className block (lines 330-335 in the current file)
    if stripped == "              className={'group relative h-24 min-w-0 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 ' + (isTodayDay":
        indent = len(line) - len(line.lstrip())
        output.append(' ' * indent + "className=`group relative h-24 min-w-0 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900 ${isTodayDay\n")
        output.append(' ' * indent + "  ? 'border-2 border-purple-600'\n")
        output.append(' ' * indent + "  : isCurrentMonthDay\n")
        output.append(' ' * indent + "    ? 'bg-white dark:bg-zinc-950'\n")
        output.append(' ' * indent + "    : 'bg-slate-50 dark:bg-zinc-900/50'`}\n")
        i += 1
        # Skip the original lines until we pass the closing brace line
        while i < len(lines) and lines[i].strip() != '}':
            i += 1
        if i < len(lines) and lines[i].strip() == '}':
            i += 1  # skip the closing brace line
        continue

    # Day number span className (line 338)
    elif stripped == "                <span className={'text-[10px] font-sans ' + (isTodayDay ? 'text-purple-600 font-bold' : 'text-slate-400')}>":
        indent = len(line) - len(line.lstrip())
        output.append(' ' * indent + "<span className={`text-[10px] font-sans ${isTodayDay ? 'text-purple-600 font-bold' : 'text-slate-400'`}>")
        i += 1
        continue

    # Event title div className block (lines 350-355)
    elif stripped == "                    className={'truncate rounded-sm px-1 py-0.5 text-[9px] font-medium ' + (event.isTentative":
        indent = len(line) - len(line.lstrip())
        output.append(' ' * indent + "className=`truncate rounded-sm px-1 py-0.5 text-[9px] font-medium ${event.isTentative\n")
        output.append(' ' * indent + "  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'\n")
        output.append(' ' * indent + "  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'`}\n")
        i += 1
        while i < len(lines) and lines[i].strip() != '}':
            i += 1
        if i < len(lines) and lines[i].strip() == '}':
            i += 1
        continue

    else:
        output.append(line)
        i += 1

with open('src/app/admin/calendar/page.tsx', 'w') as f:
    f.writelines(output)
