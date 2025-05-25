"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  getCounsellorColleges, 
  getCounsellorCourses, 
  getCounsellorCollegeById,
  searchCounsellorColleges,
  searchCounsellorCourses
} from "@/services/counsellor-colleges";

/**
 * Hook to fetch colleges for counsellors
 */
export function useCounsellorColleges() {
  const {
    data: colleges = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["counsellor-colleges"],
    queryFn: getCounsellorColleges,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    colleges,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch courses for counsellors
 * @param collegeId Optional college ID to filter courses
 */
export function useCounsellorCourses(collegeId?: string) {
  const {
    data: courses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["counsellor-courses", collegeId],
    queryFn: () => getCounsellorCourses(collegeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    courses,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch a specific college by ID for counsellors
 * @param collegeId The college ID
 */
export function useCounsellorCollegeById(collegeId: string) {
  const {
    data: college,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["counsellor-college", collegeId],
    queryFn: () => getCounsellorCollegeById(collegeId),
    enabled: !!collegeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    college,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to search colleges for counsellors
 * @param searchTerm The search term
 * @param enabled Whether the search should be enabled
 */
export function useCounsellorCollegeSearch(searchTerm: string, enabled: boolean = true) {
  const {
    data: colleges = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["counsellor-college-search", searchTerm],
    queryFn: () => searchCounsellorColleges(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    colleges,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to search courses for counsellors
 * @param searchTerm The search term
 * @param enabled Whether the search should be enabled
 */
export function useCounsellorCourseSearch(searchTerm: string, enabled: boolean = true) {
  const {
    data: courses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["counsellor-course-search", searchTerm],
    queryFn: () => searchCounsellorCourses(searchTerm),
    enabled: enabled && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    courses,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
