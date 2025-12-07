import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-8 pb-8">
      <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl flex mx-auto animate-pulse">
        {/* Sidebar Skeleton */}
        <div className="w-1/3 bg-slate-900/5 p-8 space-y-8 flex-shrink-0 border-r border-slate-100">
           <div className="space-y-4 flex flex-col items-center">
                <Skeleton className="h-32 w-32 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
           </div>
           
           <div className="space-y-6 pt-8">
               <Skeleton className="h-4 w-24 bg-slate-200" />
               <div className="space-y-3">
                   <Skeleton className="h-3 w-full" />
                   <Skeleton className="h-3 w-full" />
                   <Skeleton className="h-3 w-3/4" />
               </div>
           </div>

           <div className="space-y-6 pt-4">
               <Skeleton className="h-4 w-24 bg-slate-200" />
               <div className="flex flex-wrap gap-2">
                   <Skeleton className="h-6 w-16 rounded-full" />
                   <Skeleton className="h-6 w-20 rounded-full" />
                   <Skeleton className="h-6 w-14 rounded-full" />
                   <Skeleton className="h-6 w-24 rounded-full" />
               </div>
           </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="w-2/3 p-8 space-y-12">
            {/* Header / Summary */}
            <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>

            {/* Experience Block 1 */}
            <div className="space-y-6">
                 <Skeleton className="h-8 w-40" />
                 <div className="space-y-4 border-l-2 border-slate-100 pl-4">
                     <div className="flex justify-between">
                         <Skeleton className="h-6 w-48" />
                         <Skeleton className="h-4 w-24" />
                     </div>
                     <Skeleton className="h-5 w-32" />
                     <div className="space-y-2 pt-2">
                         <Skeleton className="h-3 w-full" />
                         <Skeleton className="h-3 w-11/12" />
                         <Skeleton className="h-3 w-4/5" />
                     </div>
                 </div>
            </div>

            {/* Experience Block 2 */}
            <div className="space-y-6">
                 <div className="space-y-4 border-l-2 border-slate-100 pl-4">
                     <div className="flex justify-between">
                         <Skeleton className="h-6 w-48" />
                         <Skeleton className="h-4 w-24" />
                     </div>
                     <Skeleton className="h-5 w-32" />
                     <div className="space-y-2 pt-2">
                         <Skeleton className="h-3 w-full" />
                         <Skeleton className="h-3 w-11/12" />
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
