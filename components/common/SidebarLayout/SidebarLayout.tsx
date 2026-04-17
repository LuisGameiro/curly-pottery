import React, { ReactNode } from 'react'
import { UserNav } from '@components/common'
import cn from 'clsx'
import s from './SidebarLayout.module.css'
import { ChevronLeft, Cross } from 'lucide-react'

type ComponentProps = { className?: string; children?: ReactNode } & (
  | { handleClose: () => void; handleBack?: never }
  | { handleBack: () => void; handleClose?: never }
)

const SidebarLayout = ({
  children,
  className,
  handleBack,
  handleClose,
}: ComponentProps) => {
  return (
    <div className={cn(s.root, className)}>
      <header className={s.header}>
        {handleClose && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="hover:text-muted/60 transition ease-in-out duration-150 flex items-center focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 mr-6"
          >
            <Cross className="h-6 w-6 hover:text-muted/60" />
            <span className="ml-2 text-muted text-sm ">Close</span>
          </button>
        )}
        {handleBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="hover:text-muted/60 transition ease-in-out duration-150 flex items-center focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
          >
            <ChevronLeft className="h-6 w-6 hover:text-muted/60" />
            <span className="ml-2 text-muted text-xs">Back</span>
          </button>
        )}

        <UserNav />
      </header>
      <div className={s.container}>{children}</div>
    </div>
  )
}

export default SidebarLayout
