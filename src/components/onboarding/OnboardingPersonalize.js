/**
 * Onboarding Personalize Component
 * 
 * Step 1: Collect user's name, birth date, and life expectancy
 * This information is used to generate their life calendar wallpaper
 */

"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function OnboardingPersonalize({ formData, updateFormData, onNext }) {
  const [errors, setErrors] = useState({});

  const handleNameChange = (e) => {
    updateFormData("name", e.target.value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleDOBChange = (e) => {
    updateFormData("dob", e.target.value);
    if (errors.dob) {
      setErrors((prev) => ({ ...prev, dob: "" }));
    }
  };

  const handleLifeExpectancyChange = (e) => {
    updateFormData("lifeExpectancyYears", parseInt(e.target.value) || 85);
    if (errors.lifeExpectancy) {
      setErrors((prev) => ({ ...prev, lifeExpectancy: "" }));
    }
  };

  // Calculate age from DOB for instant feedback
  const getAge = () => {
    if (!formData.dob) return null;
    const today = new Date();
    const birthDate = new Date(formData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate weeks lived for instant feedback
  const getWeeksLived = () => {
    if (!formData.dob) return null;
    const birthDate = new Date(formData.dob);
    const now = new Date();
    const weeksLived = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24 * 7));
    return weeksLived;
  };

  // Calculate total weeks in life
  const getTotalWeeks = () => {
    return formData.lifeExpectancyYears * 52;
  };

  // Calculate weeks remaining
  const getWeeksRemaining = () => {
    const total = getTotalWeeks();
    const lived = getWeeksLived();
    return lived ? Math.max(0, total - lived) : null;
  };

  const age = getAge();
  const weeksLived = getWeeksLived();
  const weeksRemaining = getWeeksRemaining();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-6 py-8 sm:px-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 mb-4">
          <span className="text-2xl">👤</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Personalize Your Grid
        </h1>
        <p className="text-orange-50 text-lg">
          Let's set up your life calendar. We use these details to map out your journey and help you stay consistent.
        </p>
      </div>

      {/* Form content */}
      <div className="px-6 py-8 sm:px-8">
        {/* Full Name */}
        <div className="mb-8">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g., Alex Johnson"
            value={formData.name}
            onChange={handleNameChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors bg-gray-50"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2">{errors.name}</p>
          )}
        </div>

        {/* Birth Date */}
        <div className="mb-8">
          <label htmlFor="dob" className="block text-sm font-semibold text-gray-900 mb-3">
            Birth Date
          </label>
          <input
            id="dob"
            type="date"
            value={formData.dob}
            onChange={handleDOBChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors bg-gray-50"
            required
          />
          {errors.dob && (
            <p className="text-red-500 text-sm mt-2">{errors.dob}</p>
          )}
          {age !== null && (
            <p className="text-gray-600 text-sm mt-2">
              You are {age} years old • {weeksLived?.toLocaleString()} weeks lived
            </p>
          )}
        </div>

        {/* Life Expectancy */}
        <div className="mb-8">
          <label htmlFor="lifeExpectancy" className="block text-sm font-semibold text-gray-900 mb-3">
            Life Expectancy (Years)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="lifeExpectancy"
              type="range"
              min="40"
              max="120"
              value={formData.lifeExpectancyYears}
              onChange={handleLifeExpectancyChange}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <span className="text-xl font-bold text-orange-600 min-w-12 text-right">
              {formData.lifeExpectancyYears}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-2">
            Total weeks: {getTotalWeeks().toLocaleString()}
          </p>
          {weeksRemaining !== null && (
            <p className="text-gray-600 text-sm mt-1">
              Weeks remaining: {weeksRemaining.toLocaleString()}
            </p>
          )}
        </div>

        {/* Stats preview */}
        {age !== null && (
          <div className="bg-orange-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-600">
              Your grid will show <span className="font-semibold text-orange-600">{getTotalWeeks().toLocaleString()} weeks</span> total,
              with <span className="font-semibold text-orange-600">{weeksLived?.toLocaleString()} weeks</span> already lived.
              This visualization helps you appreciate your time and stay consistent with your goals.
            </p>
          </div>
        )}

        {/* Next button */}
        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
