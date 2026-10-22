import re

with open('src/app/admin/calendar/page.tsx', 'r') as f:
    content = f.read()

# Pattern for conflict markers
pattern = r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> worktree-calendar-edit'

def resolve_button_hover(match):
    # match.group(1) is HEAD side, match.group(2) is worktree side
    # We want to keep HEAD side for button className (hover)
    # But we need to check if this conflict is about button className.
    # We'll assume that if the string contains 'transition-colors dark:border-zinc-800 dark:text-zinc-400' and then either 'dark:hover:bg-zinc-900' or 'dark:bg-zinc-900/50', we choose the hover version.
    head = match.group(1)
    work = match.group(2)
    if 'transition-colors dark:border-zinc-800 dark:text-zinc-400' in head and 'transition-colors dark:border-zinc-800 dark:text-zinc-400' in work:
        # Choose the one with hover
        if 'dark:hover:bg-zinc-900' in head:
            return head
        else:
            # If work has hover? but worktree-calendar-edit had bg-zinc-900/50, not hover.
            # So default to head if head has hover.
            return head
    # For other conflicts, we'll decide case by case below.
    return head  # default to HEAD

# We'll apply specific resolutions based on context.
# Instead of a generic resolver, we'll do specific replacements.

# Let's split by the pattern and process each segment.
parts = re.split(r'(<<<<<<< HEAD\n.*?\n=======\n.*?\n>>>>>>> worktree-calendar-edit)', content, flags=re.DOTALL)
resolved = []
for part in parts:
    if part.startswith('<<<<<<< HEAD'):
        # This is a conflict block, we need to resolve it.
        # Extract the head and work parts.
        inner = part[len('<<<<<<< HEAD'): -len('\n=======\n') - len('\n>>>>>>> worktree-calendar-edit')]
        # Actually easier: we already have the pattern, but we'll do a different approach.
        pass
    else:
        resolved.append(part)

# Let's do a simpler approach: use the pattern with a function that decides based on surrounding text.
# We'll implement specific rules.

# We'll replace each conflict individually by searching for the exact strings.

# 1. Button className for Week button (lines around 233-241)
# We'll replace the whole block from the line containing 'state.view === \'week\'' to the line containing the closing backtick of the className.
# But we'll do a simpler: replace the specific pattern we saw.

# Since we have the file content, we can do:

# Replace the Week button className conflict:
# Look for: state.view === 'week' followed by className=... until the closing backtick and brace.
# We'll do a regex that captures the whole className attribute for the Week button.

# We'll do multiple passes.

# First, fix the button className for Week and Agenda to use hover.
# We'll replace the className for the Week button and Agenda button with the HEAD version (hover).

# We'll do a simple string replace for the two instances we know.

# But there might be more than two. Let's just fix the ones we saw.

# We'll do:

# Replace the Week button className block:
# From: className={`rounded-lg px-3 py-2 text-sm font-medium ${
#   state.view === 'week'
#     ? 'bg-primary text-white'
#     : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
# } transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900`}
// To: (we want to keep exactly that, which is already HEAD? Actually the file currently has the conflict markers.
// We need to remove the conflict markers and keep the HEAD version.

# We'll do a regex that matches from the start of the conflict marker to the end, and replace with the HEAD version.

# We'll write a regex that matches the specific conflict for the Week button.

# We'll do it stepwise with re.sub.

# Define a function to replace a specific conflict block given a unique identifier.

# We'll use the fact that each conflict block has unique surrounding text.

# Let's just do a manual replacement for each conflict we know.

# We'll read the file line by line and build a new lines list, skipping conflict markers and choosing sides.

lines = content.splitlines()
i = 0
new_lines = []
while i < len(lines):
    line = lines[i]
    if line.strip() == '<<<<<<< HEAD':
        # Find the matching ======= and >>>>>>>>
        j = i + 1
        while j < len(lines) and lines[j].strip() != '=======':
            j += 1
        if j >= len(lines):
            new_lines.append(line)
            i += 1
            continue
        k = j + 1
        while k < len(lines) and lines[k].strip() != '>>>>>>> worktree-calendar-edit':
            k += 1
        if k >= len(lines):
            new_lines.append(line)
            i += 1
            continue
        # Now we have head lines from i+1 to j-1, work lines from j+1 to k-1.
        head_lines = lines[i+1:j]
        work_lines = lines[j+1:k]
        # Decide which side to take based on the context.
        # We'll check if the conflict is about button className for Week or Agenda.
        # We'll join the head lines and work lines to strings.
        head_block = '\n'.join(head_lines)
        work_block = '\n'.join(work_lines)
        # Determine the conflict type by looking at the lines.
        # If the block contains 'state.view === \'week\'' and 'transition-colors dark:border-zinc-800 dark:text-zinc-400' and ('dark:hover:bg-zinc-900' in head_block or 'dark:bg-zinc-900/50' in head_block):
        if 'state.view === \'week\'' in head_block and 'transition-colors dark:border-zinc-800 dark:text-zinc-400' in head_block:
            # Choose HEAD side (hover)
            new_lines.extend(head_lines)
        elif 'state.view === \'agenda\'' in head_block and 'transition-colors dark:border-zinc-800 dark:text-zinc-400' in head_block:
            # Choose HEAD side (hover)
            new_lines.extend(head_lines)
        elif 'isCurrentWeekDay' in head_block and ': ' in head_block and 'bg-slate-50 dark:bg-zinc-900/50' in head_block:
            # This is the else background conflict in WeekView: choose HEAD (dark:bg-zinc-900/50)
            new_lines.extend(head_lines)
        elif 'function getEventsForDay(day: Date)' in head_block:
            # This is the erroneous function in MonthView: we want to remove it, so take work side (which is empty)
            new_lines.extend(work_lines)
        else:
            # Default to HEAD
            new_lines.extend(head_lines)
        i = k + 1
    else:
        new_lines.append(line)
        i += 1

with open('src/app/admin/calendar/page.tsx', 'w') as f:
    f.write('\n'.join(new_lines))
