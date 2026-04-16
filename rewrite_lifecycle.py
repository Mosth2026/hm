import sys

file_path = "src/pages/AdminDashboard.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# The block to replace
old_block_marker = "            {/* Product Lifecycle Dialog */}"
new_lifecycle_block = """            {/* Product Lifecycle Dialog */}
            <Dialog open={isLifecycleOpen} onOpenChange={setIsLifecycleOpen}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl overflow-hidden p-0 border-none shadow-2xl font-tajawal rtl" dir="rtl">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-white">
                        <DialogHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Clock className="h-8 w-8" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black">قصة حياة المنتج</DialogTitle>
                                    <p className="text-white/80 font-medium mt-1">{lifecycleProduct?.name}</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {lifecycleLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
                                <p className="text-gray-500 font-bold">جاري استرجاع ذكريات المنتج...</p>
                            </div>
                        ) : lifecycleData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-400 font-bold text-lg">لم نعثر على سجلات قديمة لهذا المنتج</p>
                            </div>
                        ) : (
                            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {lifecycleData.map((item, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${item.type === 'ALERT' ? 'bg-red-600 text-white' :
                                                (item.label.includes('دخول') ? 'bg-emerald-600 text-white' :
                                                    (item.label.includes('خروج') ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'))
                                            }`}>
                                            {item.type === 'SALE' || item.label.includes('خروج') ? <TrendingUp className="h-4 w-4" /> :
                                                item.type === 'ALERT' ? <AlertTriangle className="h-4 w-4" /> :
                                                    item.type === 'ADMIN' ? <Edit className="h-4 w-4" /> :
                                                        <SparklesIcon className="h-4 w-4" />}
                                        </div>
                                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${item.type === 'ALERT' ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
                                            }`}>
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-900">{item.label}</div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <time className="text-[10px] font-tajawal font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                                        {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </time>
                                                    <time className="text-[10px] font-bold text-gray-400">
                                                        {new Date(item.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                    </time>
                                                </div>
                                            </div>
                                            <div className="text-slate-500 text-sm">{item.note}</div>
                                            {item.type === 'SALE' && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                                                        {item.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Category Update Dialog */}"""

# We'll replace everything from marker to Bulk Dialog marker.
bulk_marker = "            {/* Bulk Category Update Dialog */}"

if old_block_marker in text and bulk_marker in text:
    start_pos = text.find(old_block_marker)
    end_pos = text.find(bulk_marker)
    text = text[:start_pos] + new_lifecycle_block + text[end_pos:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Lifecycle block completely rewritten.")
else:
    print("Markers not found.")
