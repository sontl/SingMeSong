import { useState } from 'react';
import { HiBars3 } from 'react-icons/hi2';
import { BiLogIn } from 'react-icons/bi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { Dialog } from '@headlessui/react';
import { Link, routes } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth';
import logo from '../../client/static/logo.png';
import DarkModeSwitcher from '../../client/components/DarkModeSwitcher';
import DropdownUser from '../../user/DropdownUser';
import { UserMenuItems } from '../../user/UserMenuItems';

interface NavigationItem {
  name: string;
  href: string;
};

export default function Header({ navigation }: { navigation: NavigationItem[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useAuth();

  const NavLogo = () => <img className='h-12 w-12' src={logo} alt='SingMeSong App' />;

  const fullNavigation = user
    ? [{ name: 'Create Song', href: routes.SingmeAppRoute.build() }, ...navigation]
    : navigation;

  return (
    <header className='absolute inset-x-0 top-0 z-50 dark:bg-boxdark-2'>
      <div className="flex justify-center items-center gap-3 p-3 w-full bg-gradient-to-r from-[#d946ef] to-[#fc0] font-semibold text-white text-center z-49">
        <Link to="/pricing" className="hidden lg:block cursor-pointer hover:opacity-90 hover:drop-shadow">🚨 Don’t miss out on SingMeSong’s limited-time deal—enjoy 53% off!  🚀</Link>
        <div className="hidden lg:block self-stretch w-0.5 bg-white"></div>
        <Link to="/pricing" className="hidden lg:block cursor-pointer rounded-full bg-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-600 tracking-wider">Check it out today!→</Link>
        <Link to="/pricing" className="lg:hidden cursor-pointer rounded-full bg-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-600 tracking-wider">🚀 Unlock limited-time 53% off now! 🚀 →</Link>
      </div>
      <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
        <div className='flex items-center lg:flex-1'>
          <Link
            to='/'
            className='flex items-center -m-1.5 p-1.5 text-gray-900 duration-300 ease-in-out hover:text-yellow-500'
          >
            <NavLogo />
            <span className='ml-2 text-sm font-semibold leading-6 dark:text-white'>SingMeSong</span>
          </Link>
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-white'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>Open main menu</span>
            <HiBars3 className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='hidden lg:flex lg:gap-x-12'>
          {fullNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href as any}
              className='text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white'
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:align-end'>
          {/* <!-- Dark Mode Toggler --> */}
          <div className='flex items-center gap-3 2xsm:gap-7'>
            <ul className='flex justify-center items-center gap-2 2xsm:gap-4'>
              <DarkModeSwitcher />
            </ul>
            {isUserLoading ? null : !user ? (
              <Link to='/login'>
                <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                  Log in <BiLogIn size='1.1rem' className='ml-1' />
                </div>
              </Link>
            ) : (
              <DropdownUser user={user} />
            )}
          </div>
        </div>
      </nav>
      <Dialog as='div' className='lg:hidden' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className='fixed inset-0 z-50' />
        <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-boxdark dark:text-white'>
          <div className='flex items-center justify-between'>
            <Link to={routes.LandingPageRoute.to} className='-m-1.5 p-1.5'>
              <span className='sr-only'>SingMeSong</span>
              <NavLogo />
            </Link>
            <button
              type='button'
              className='-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-50'
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className='sr-only'>Close menu</span>
              <AiFillCloseCircle className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <div className='mt-6 flow-root'>
            <div className='-my-6 divide-y divide-gray-500/10'>
              <div className='space-y-2 py-6'>
                {fullNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href as any}
                    onClick={() => setMobileMenuOpen(false)}
                    className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-boxdark-2'
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className='py-6'>
                {isUserLoading ? null : !user ? (
                  <Link to='/login'>
                    <div className='flex justify-start items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                      Log in <BiLogIn size='1.1rem' className='ml-1' />
                    </div>
                  </Link>
                ) : (
                  <UserMenuItems user={user} />
                )}
              </div>
              <div className='py-6'>
                <DarkModeSwitcher />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
