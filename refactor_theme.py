import os

filepath = r'c:\Users\User\Downloads\edumit-20250414T165044Z-001\Medibot-UIiiiiiiiiiii\src\components\PatientDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Ordered replacements to avoid conflicts
replacements = [
    ('bg-white', 'bg-[#1A1C23]'),
    ('bg-slate-50/50', 'bg-[#1A1C23]/50'),
    ('bg-slate-50', 'bg-[#0F1015]'),
    ('bg-slate-100', 'bg-[#121318]'),
    ('text-slate-900', 'text-white'),
    ('text-slate-800', 'text-slate-200'),
    ('text-slate-700', 'text-slate-300'),
    ('text-slate-600', 'text-slate-400'),
    ('border-slate-200', 'border-white/5'),
    ('border-slate-100', 'border-white/5'),
    ('border-slate-50', 'border-white/5'),
    ('shadow-sm', 'shadow-2xl shadow-black/20'),
    ('shadow-md', 'shadow-2xl shadow-black/40'),
    ('bg-sky-50', 'bg-sky-500/10 ring-1 ring-sky-500/20'),
    ('text-sky-600', 'text-sky-400'),
    ('text-sky-700', 'text-sky-300'),
    ('border-sky-100', 'border-sky-500/20'),
    ('bg-emerald-50', 'bg-emerald-500/10 ring-1 ring-emerald-500/20'),
    ('text-emerald-700', 'text-emerald-400'),
    ('text-emerald-600', 'text-emerald-400'),
    ('border-emerald-100', 'border-emerald-500/20'),
    ('bg-red-50', 'bg-red-500/10 ring-1 ring-red-500/20'),
    ('text-red-700', 'text-red-400'),
    ('text-red-600', 'text-red-400'),
    ('bg-amber-50', 'bg-amber-500/10 ring-1 ring-amber-500/20'),
    ('text-amber-900', 'text-amber-400'),
    ('text-amber-700', 'text-amber-300'),
    ('border-amber-200', 'border-amber-500/20'),
    ('text-slate-500', 'text-slate-400'), # Will make 500 into 400
    ('hover:bg-slate-50', 'hover:bg-white/5'),
    ('hover:bg-slate-100', 'hover:bg-white/10'),
    ('hover:text-slate-700', 'hover:text-white'),
    ('hover:text-slate-600', 'hover:text-white'),
    ('min-h-screen bg-[#0F1015]', 'min-h-screen bg-[#0F1015] text-slate-200 font-sans selection:bg-sky-500/30'),
    ('bg-[#1A1C23] border border-white/5', 'glass-card border-white/5'),
]

for old, new in replacements:
    content = content.replace(old, new)
    
# Manual targeted fixes
content = content.replace('w-64 bg-[#1A1C23] border-r border-white/5', 'w-64 glass-card border-r border-white/5')
content = content.replace('h-20 bg-[#1A1C23] border-b', 'h-20 glass-card border-b backdrop-blur-md sticky top-0 z-20')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Theme replaced successfully!")
