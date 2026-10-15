import sys

filename = 'src/app/admin/calendar/page.tsx'

with open(filename, 'r') as f:
    lines = f.readlines()

i = 0
while i < len(lines):
    line = lines[i]
    if 'onClick={() => handleViewChange('week')}' in line and i+1 < len(lines) and 'className={' in lines[i+1]:
        j = i+1
        while j < len(lines):
            if '`' in lines[j] and j > i+1 and lines[j].strip().endswith('`})'):
                break
            j += 1
        if j < len(lines):
            new_classname = [
                '                  className={\n',
                '                    \'rounded-lg px-3 py-2 text-sm font-medium \' +\n',
                '                    (state.view === \'week\' ? \'bg-purple-600 text-white\' : \'border border-slate-200 text-slate-500 hover:bg-slate-50\') +\n',
                '                    \' transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:bg-zinc-900/50\'\n',
                '                  }\n'
            ]
            del lines[i+1:j+1]
            lines[i+1:i+1] = new_classname
            i = i+1 + len(new_classname)
            continue
    if 'onClick={() => handleViewChange('agenda')}' in line and i+1 < len(lines) and 'className={' in lines[i+1]:
        j = i+1
        while j < len(lines):
            if '`' in lines[j] and j > i+1 and lines[j].strip().endswith('`})'):
                break
            j += 1
        if j < len(lines):
            new_classname = [
                '                  className={\n',
                '                    \'rounded-lg px-3 py-2 text-sm font-medium \' +\n',
                '                    (state.view === \'agenda\' ? \'bg-purple-600 text-white\' : \'border border-slate-200 text-slate-500 hover:bg-slate-50\') +\n',
                '                    \' transition-colors dark:border-zinc-800 dark:text-zinc-400 dark:bg-zinc-900/50\'\n',
                '                  }\n'
            ]
            del lines[i+1:j+1]
            lines[i+1:i+1] = new_classname
            i = i+1 + len(new_classname)
            continue
    i += 1

with open(filename, 'w') as f:
    f.writelines(lines)
