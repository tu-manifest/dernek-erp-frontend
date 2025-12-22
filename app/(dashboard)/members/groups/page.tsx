"use client"
import React from 'react';
import GroupTable from '../../../../components/groupTypesTable';
import useGetGroups from '../../../../hooks/useGetGroups';

export default function MemberGroupsPage() {
  // Hook'u kullanarak grupları çek
  const { groups, isLoading, isError, refetch } = useGetGroups();

  // API'den gelen veriyi parse et
  let groupsData: any[] = [];
  let statistics = null;

  if (groups) {
    if (Array.isArray(groups)) {
      groupsData = groups;
    } else if ((groups as any).groups && Array.isArray((groups as any).groups)) {
      groupsData = (groups as any).groups;
      statistics = (groups as any).statistics;
    } else if ((groups as any).data && Array.isArray((groups as any).data)) {
      groupsData = (groups as any).data;
    }
  }

  return (
    <div className="p-6">
      <GroupTable
        groups={groupsData}
        statistics={statistics}
        isLoading={isLoading}
        isError={isError}
        refetch={refetch}
      />
    </div>
  );
}