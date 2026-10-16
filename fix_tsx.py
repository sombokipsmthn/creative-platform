import sys

with open('src/app/admin/calendar/page.tsx', 'r') as f:
    lines = f.readlines()

new_lines = lines[:315]  # up to index 314 (line 315 1-indexed)

new_lines.append('       {/* Weekday headers */}\n')
new_lines.append('       <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-sans uppercase tracking-widest text-slate-400 dark:text-zinc-500">\n')
new_lines.append('         {Array.from({length: 7}).map((_, i) => {\n')
new_lines.append('           const dayName = [\'Sun\', \'Mon\', \'Tue\', \'Wed\', \'Thu\', \'Fri\', \'Sat\'][\n')
new_lines.append('             (i + 1) % 7\n')
new_lines.append('           ]; // Start with Monday\n')
new_lines.append('           return <div key={i}>{dayName}</div>;\n')
new_lines.append('         })}\n')
new_lines.append('       </div>\n')

new_lines.extend(lines[323:])

with open('src/app/admin/calendar/page.tsx', 'w') as f:
    f.writelines(new_lines)
