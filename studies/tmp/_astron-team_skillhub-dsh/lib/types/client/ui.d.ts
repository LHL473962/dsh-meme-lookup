/** shadcn/ui (MIT), New York/Radix components adapted to scoped DSH CSS.
 * Source: https://ui.shadcn.com/r/styles/new-york/{button,card,input,avatar,tabs,dialog}.json
 * Utility classes are replaced by astron-sh-* classes; React and ReactDOM remain host externals.
 */
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
declare const buttonVariants: (props?: ({
    variant?: "default" | "outline" | "ghost" | "destructive" | null | undefined;
    size?: "default" | "sm" | "icon" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export declare const Card: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLHeadingElement>>;
export declare const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export declare const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export declare const Avatar: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarProps & React.RefAttributes<HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export declare const AvatarImage: React.ForwardRefExoticComponent<AvatarPrimitive.AvatarImageProps & React.RefAttributes<HTMLImageElement>>;
export declare const AvatarFallback: React.ForwardRefExoticComponent<AvatarPrimitive.AvatarFallbackProps & React.RefAttributes<HTMLSpanElement>>;
export declare const Tabs: React.ForwardRefExoticComponent<TabsPrimitive.TabsProps & React.RefAttributes<HTMLDivElement>>;
export declare const TabsList: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export declare const TabsTrigger: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export declare const TabsContent: React.ForwardRefExoticComponent<TabsPrimitive.TabsContentProps & React.RefAttributes<HTMLDivElement>>;
export declare const Dialog: React.FC<DialogPrimitive.DialogProps>;
export declare const DialogTitle: React.ForwardRefExoticComponent<DialogPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>;
export declare const DialogDescription: React.ForwardRefExoticComponent<DialogPrimitive.DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>>;
export declare function DialogContent({ container, children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    container: HTMLElement | null;
}): import("react/jsx-runtime").JSX.Element;
/** shadcn/ui Select (MIT), New York registry select.json; scoped CSS replaces utilities. */
export declare const SelectField: React.ForwardRefExoticComponent<{
    label: string;
    value: string;
    onValueChange(value: string): void;
    disabled?: boolean;
    options: readonly {
        value: string;
        label: string;
        disabled?: boolean;
    }[];
} & React.RefAttributes<HTMLButtonElement>>;
/** shadcn Skeleton structure, using local DSH semantic colors instead of utility classes. */
export declare function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
export {};
