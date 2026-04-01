"use client";

import { CheckCircle2, Circle } from "lucide-react";

/**
 * ToggleRow Component - Enhanced Version
 * 
 * Reusable toggle switch with label and description:
 * ✨ Smooth animated toggle with visual feedback
 * ✨ Support for main label and sub-label/description
 * ✨ Icon indicators (checked and unchecked states)
 * ✨ Responsive sizing
 * ✨ Accessibility features (proper form labels)
 * ✨ Hover states with smooth transitions
 * 
 * Usage: Display options like "Show Grid", "Show Legend", etc.
 */
export default function ToggleRow({ label, subLabel, checked, onChange, name }) {
    return (
        <div className="flex items-center justify-between py-3.5 px-3 sm:px-4 hover:bg-gray-50/50 transition-colors rounded-lg">
            
            {/* Label Section - Left Side */}
            <div className="flex-1 min-w-0">
                <label 
                    htmlFor={name}
                    className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-gray-700 transition-colors block"
                >
                    {label}
                </label>
                {subLabel && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {subLabel}
                    </p>
                )}
            </div>

            {/* Toggle Switch - Right Side */}
            <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                <input
                    type="checkbox"
                    id={name}
                    className="sr-only peer"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                />
                
                {/* Toggle Background */}
                <div className="relative inline-block w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 transition-all duration-300 shadow-sm peer-focus:ring-2 peer-focus:ring-orange-300">
                    
                    {/* Toggle Slider Circle */}
                    <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5 flex items-center justify-center">
                        {checked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                        ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-400" />
                        )}
                    </div>
                </div>
                
                {/* Visual Feedback Text */}
                <span className="ml-2 text-xs font-bold text-gray-600 select-none transition-opacity">
                    {checked ? "✓" : "–"}
                </span>
            </label>
        </div>
    );
}
