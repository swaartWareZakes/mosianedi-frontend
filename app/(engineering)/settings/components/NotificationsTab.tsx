"use client";

import React, { useState } from "react";
import { Mail, Bell, AlertCircle } from "lucide-react";

export default function NotificationsTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
        <p className="text-sm text-slate-500">Control when and how we communicate with you.</p>
      </div>

      <div className="space-y-6">
          <Section title="Project Activity" icon={<Bell className="w-4 h-4"/>}>
              <ToggleRow label="Simulation Completed" desc="Receive an alert when a heavy calculation finishes." defaultChecked />
              <ToggleRow label="Report Generated" desc="Notify when a PDF export is ready for download." defaultChecked />
              <ToggleRow label="New Team Comment" desc="When a colleague comments on a project." />
          </Section>

          <Section title="Email Alerts" icon={<Mail className="w-4 h-4"/>}>
              <ToggleRow label="Weekly Digest" desc="A summary of network condition changes." />
              <ToggleRow label="Critical Infrastructure Warnings" desc="Immediate email when VCI drops below threshold." defaultChecked />
              <ToggleRow label="Product Updates" desc="News about Mosianedi features." />
          </Section>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
              <h4 className="text-sm font-bold text-amber-800">System Wide Alerts</h4>
              <p className="text-xs text-amber-700 mt-1">
                  You cannot disable security alerts or password reset notifications. These will always be sent to your primary email.
              </p>
          </div>
      </div>

    </div>
  );
}

function Section({ title, icon, children }: any) {
    return (
        <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                {icon} {title}
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
                {children}
            </div>
        </div>
    )
}

function ToggleRow({ label, desc, defaultChecked }: any) {
    const [checked, setChecked] = useState(defaultChecked || false);
    return (
        <div className="py-4 flex items-center justify-between">
            <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
            </div>
            <button 
                onClick={() => setChecked(!checked)}
                className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-transform ${checked ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    )
}