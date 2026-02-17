import { ArchitectureVisualization } from '@/components/architecture/ArchitectureVisualization';

export const metadata = {
  title: 'System Architecture | Forge',
  description: 'Interactive visualization of the Forge system architecture',
};

/**
 * System Architecture Page
 * 
 * This page is intentionally PUBLIC and does not require authentication.
 * Anyone can view the Forge system architecture visualization.
 * 
 * Route: /system-architecture
 * Access: Public (no login required)
 */
export default function SystemArchitecturePage() {
  return (
    <div className="h-screen w-full bg-bg-primary">
      <ArchitectureVisualization />
    </div>
  );
}
