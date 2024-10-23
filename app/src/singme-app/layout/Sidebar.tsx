import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../../client/static/logo.png';
import SidebarLinkGroup from './SidebarLinkGroup';
import { cn } from '../../client/cn';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={cn(
        'absolute left-0 top-0 z-9999 flex h-screen  w-62.5 flex-col overflow-y-hidden bg-gray-800 duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0',
        {
          'translate-x-0': sidebarOpen,
          '-translate-x-full': !sidebarOpen,
        }
      )}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className='flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5'>
        <NavLink to='/'>
          <img src={Logo} alt='Logo' width={50} />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls='sidebar'
          aria-expanded={sidebarOpen}
          className='block lg:hidden'
        >
          <svg
            className='fill-current'
            width='20'
            height='18'
            viewBox='0 0 20 18'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z'
              fill=''
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className='no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear'>
        {/* <!-- Sidebar Menu --> */}
        <nav className='mt-5 py-4 px-4 lg:mt-9 lg:px-6'>
          {/* <!-- Menu Group --> */}
          <div>
            <ul className='mb-6 flex flex-col gap-1.5'>
              {/* <!-- Menu Item Dashboard --> */}
              <NavLink
                to='/create'
                className={() =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-gray-700 dark:hover:bg-meta-4',
                    {
                      'bg-gray-700 dark:bg-meta-4': location.pathname === '/create',
                    }
                  )
                }
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Create
              </NavLink>

              {/* <!-- Menu Item Dashboard --> */}
              {/* <!-- Menu Item Transcribe --> */}
              <NavLink
                to='/transcribe'
                className={() =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-gray-700 dark:hover:bg-meta-4',
                    {
                      'bg-gray-700 dark:bg-meta-4': location.pathname === '/transcribe',
                    }
                  )
                }
              >
                <svg
                  className="fill-current"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="currentColor">
                    CC
                  </text>
                </svg>
                Transcribe
              </NavLink>
              {/* <!-- Menu Item Lyric Video --> */}
              <NavLink
                to='/lyric-video'
                className={() =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-gray-700 dark:hover:bg-meta-4',
                    {
                      'bg-gray-700 dark:bg-meta-4': location.pathname === '/lyric-video',
                    }
                  )
                }
              >
                <svg
                  className='fill-current'
                  width='18'
                  height='18'
                  viewBox='0 0 18 18'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M15.7501 0.55835H2.2501C1.29385 0.55835 0.506348 1.34585 0.506348 2.3021V15.8021C0.506348 16.7584 1.29385 17.574 2.27822 17.574H15.7782C16.7345 17.574 17.5501 16.7865 17.5501 15.8021V2.3021C17.522 1.34585 16.7063 0.55835 15.7501 0.55835ZM1.75635 8.55835H4.25635V11.0583H1.75635V8.55835ZM5.50635 8.55835H8.00635V11.0583H5.50635V8.55835ZM8.00635 12.3083V14.8083H5.50635V12.3083H8.00635ZM9.25635 12.3083H11.7563V14.8083H9.25635V12.3083ZM9.25635 11.0583V8.55835H11.7563V11.0583H9.25635ZM13.0063 8.55835H15.5063V11.0583H13.0063V8.55835ZM2.2501 1.80835H15.7501C16.0313 1.80835 16.2563 2.03335 16.2563 2.3146V7.30835H1.75635V2.3146C1.75635 2.03335 1.9813 1.80835 2.2501 1.80835ZM1.75635 15.8021V12.3083H4.25635V14.8083H1.7501C1.7501 14.8146 1.75635 15.8021 1.75635 15.8021ZM15.7501 16.324H2.2501C1.9813 16.324 1.75635 16.099 1.75635 15.8177V16.3021H15.5063V12.3083H16.2563V15.8021C16.2563 16.099 16.0313 16.324 15.7501 16.324Z'
                    fill=''
                  />
                </svg>
                Lyric Video
              </NavLink>

              
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
