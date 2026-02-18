'use client';

import { User } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserSelectorProps {
  users: Pick<User, 'id' | 'full_name' | 'email'>[];
  selectedUserId: string | null;
  onSelect: (userId: string | null) => void;
}

export function UserSelector({ users, selectedUserId, onSelect }: UserSelectorProps) {
  return (
    <Select
      value={selectedUserId || 'all'}
      onValueChange={(val) => onSelect(val === 'all' ? null : val)}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="All users" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Users (Cumulative)</SelectItem>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.full_name || u.email.split('@')[0]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
