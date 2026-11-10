import { forwardRef, type SVGAttributes } from 'react';
import { cn } from '../../utils/helpers';
import {
  // Common icons
  Layers, Menu, X, ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Check, X as XIcon, AlertTriangle, AlertCircle, Info, Loader,
  Globe, Code, Wrench, Network, Wifi, HardDrive, Shield, Server,
  Cpu, Monitor, LayoutDashboard, Ticket, Package, TreePine, Users,
  LifeBuoy, Target, Lightbulb, Eye, BookOpen, GraduationCap, MapPin,
  Mail, Phone, Clock,
  Calendar, School, ShieldAlert, ShieldCheck, LogOut, Sparkles,
  SearchCheck, Truck, CheckCircle2, CalendarClock, MoreHorizontal,
  Image, SearchX, RotateCcw, TrendingUp, FileText, Database, Cloud,
  BarChart2, Settings, Zap, Lock, Unlock, Key, Home, Building,
  Briefcase, Folder, FolderOpen, File, Edit, Trash2, Plus, Minus, Download,
  Upload, Share2, ExternalLink, Copy, LayoutGrid, MessageSquare, MousePointer2,
  Redo2, Undo2, Bold, Italic, Underline, Strikethrough, Code2,
  Terminal, Database as DatabaseIcon, Server as ServerIcon,
  Wifi as WifiIcon, Cpu as CpuIcon, HardDrive as HardDriveIcon,
  Shield as ShieldIcon, Globe as GlobeIcon, Network as NetworkIcon,
  Users as UsersIcon, Monitor as MonitorIcon, LayoutDashboard as LayoutDashboardIcon,
  Package as PackageIcon, TreePine as TreePineIcon, LifeBuoy as LifeBuoyIcon,
  Target as TargetIcon, Lightbulb as LightbulbIcon, Eye as EyeIcon,
  BookOpen as BookOpenIcon, GraduationCap as GraduationCapIcon,
  MapPin as MapPinIcon, Mail as MailIcon, Phone as PhoneIcon,
  Clock as ClockIcon, GitBranch, GitFork, GitMerge, Link, Link2,
  Unlink, Unlink2, PenTool, Toolbox, ToolCase,
  ClipboardList, ClipboardCheck, CheckSquare, ListTodo, FileCheck
} from 'lucide-react';

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  name: string;
  size?: number;
  strokeWidth?: number;
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // Core icons
  Layers, Menu, X, ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
  Check, XIcon, AlertTriangle, AlertCircle, Info, Loader,
  Globe, Code, Wrench, Network, Wifi, HardDrive, Shield, Server,
  Cpu, Monitor, LayoutDashboard, Ticket, Package, TreePine, Users,
  LifeBuoy, Target, Lightbulb, Eye, BookOpen, GraduationCap, MapPin,
  Mail, Phone, Clock,
  Calendar, School, ShieldAlert, ShieldCheck, LogOut, Sparkles,
  // Social/brand icons (using closest available alternatives)
  Linkedin: GitBranch,
  Github: GitFork,
  Facebook: GitMerge,
  Twitter: Link,
  // Additional icons
  SearchCheck, Truck, CheckCircle2, CalendarClock, MoreHorizontal,
  Image, SearchX, RotateCcw, TrendingUp, FileText, Database, Cloud,
  BarChart2, Settings, Zap, Lock, Unlock, Key, Home, Building,
  Briefcase, Folder, FolderOpen, File, Edit, Trash2, Plus, Minus, Download,
  Upload, Share2, ExternalLink, Copy, Layout: LayoutGrid, LayoutGrid, MessageSquare, MousePointer2,
  Redo2, Undo2, Bold, Italic, Underline, Strikethrough, Code2,
  Terminal, DatabaseIcon, ServerIcon, WifiIcon, CpuIcon, HardDriveIcon,
  ShieldIcon, GlobeIcon, NetworkIcon, UsersIcon, MonitorIcon, LayoutDashboardIcon,
  PackageIcon, TreePineIcon, LifeBuoyIcon, TargetIcon, LightbulbIcon, EyeIcon,
  BookOpenIcon, GraduationCapIcon, MapPinIcon, MailIcon, PhoneIcon,
  ClockIcon, GitBranch, GitFork, GitMerge, Link, Link2,
  Unlink, Unlink2, PenTool, Toolbox, ToolCase,
  ClipboardList, ClipboardCheck, CheckSquare, ListTodo, FileCheck,
  Task: ClipboardList, Tasks: ClipboardList
};

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, name, size = 24, strokeWidth = 1.5, ...props }, ref) => {
    const IconComponent =
      iconMap[name] ||
      (name ? iconMap[name.charAt(0).toUpperCase() + name.slice(1)] : undefined);

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in icon map`);
      return null;
    }

    return (
      <IconComponent
        ref={ref}
        className={cn('shrink-0', className)}
        width={size}
        height={size}
        strokeWidth={strokeWidth}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };