import { useFavouritesStore } from './favourites'
import {
  addFavouriteAction,
  removeFavouriteAction,
  getFavouritesAction,
} from '@actions/Favourite.actions'
import { toast } from 'sonner'

jest.mock('@actions/Favourite.actions', () => ({
  addFavouriteAction: jest.fn(),
  removeFavouriteAction: jest.fn(),
  getFavouritesAction: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const initialStoreState = {
  favouriteIds: [],
  isLoading: false,
  isHydrated: false,
}

describe('useFavouritesStore', () => {
  beforeEach(() => {
    useFavouritesStore.setState(initialStoreState)
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty favouriteIds, isLoading false, isHydrated false', () => {
      const state = useFavouritesStore.getState()
      expect(state.favouriteIds).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.isHydrated).toBe(false)
    })
  })

  describe('addFavourite', () => {
    it('should add a product ID to the list', async () => {
      jest
        .mocked(addFavouriteAction)
        .mockResolvedValue({ success: true, message: 'ok', data: null })

      await useFavouritesStore.getState().addFavourite('prod-1')

      expect(useFavouritesStore.getState().favouriteIds).toContain('prod-1')
    })

    it('should do nothing when ID already exists (early return)', async () => {
      useFavouritesStore.setState({ favouriteIds: ['prod-1'] })

      await useFavouritesStore.getState().addFavourite('prod-1')

      expect(useFavouritesStore.getState().favouriteIds).toEqual(['prod-1'])
      expect(addFavouriteAction).not.toHaveBeenCalled()
    })

    it('should call addFavouriteAction and show success toast', async () => {
      jest
        .mocked(addFavouriteAction)
        .mockResolvedValue({ success: true, message: 'ok', data: null })

      await useFavouritesStore.getState().addFavourite('prod-1')

      expect(addFavouriteAction).toHaveBeenCalledWith('prod-1')
      expect(toast.success).toHaveBeenCalledWith('Added to favourites')
    })

    it('should roll back optimistic update on failure and show error toast', async () => {
      jest
        .mocked(addFavouriteAction)
        .mockRejectedValue(new Error('Network error'))
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await useFavouritesStore.getState().addFavourite('prod-1')

      expect(useFavouritesStore.getState().favouriteIds).not.toContain('prod-1')
      expect(toast.error).toHaveBeenCalledWith('Failed to add to favourites')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to add favourite',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('removeFavourite', () => {
    it('should remove a product ID and call removeFavouriteAction', async () => {
      useFavouritesStore.setState({ favouriteIds: ['prod-1', 'prod-2'] })
      jest
        .mocked(removeFavouriteAction)
        .mockResolvedValue({ success: true, message: 'ok', data: null })

      await useFavouritesStore.getState().removeFavourite('prod-1')

      expect(useFavouritesStore.getState().favouriteIds).toEqual(['prod-2'])
      expect(removeFavouriteAction).toHaveBeenCalledWith('prod-1')
      expect(toast.success).toHaveBeenCalledWith('Removed from favourites')
    })

    it('should roll back optimistic removal on failure', async () => {
      useFavouritesStore.setState({ favouriteIds: ['prod-1', 'prod-2'] })
      jest
        .mocked(removeFavouriteAction)
        .mockRejectedValue(new Error('Network error'))
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await useFavouritesStore.getState().removeFavourite('prod-1')

      expect(useFavouritesStore.getState().favouriteIds).toEqual([
        'prod-1',
        'prod-2',
      ])
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to remove from favourites',
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to remove favourite',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('toggleFavourite', () => {
    it('should call addFavourite when product is not favourited', async () => {
      jest
        .mocked(addFavouriteAction)
        .mockResolvedValue({ success: true, message: 'ok', data: null })

      await useFavouritesStore.getState().toggleFavourite('prod-1')

      expect(useFavouritesStore.getState().favouriteIds).toContain('prod-1')
      expect(addFavouriteAction).toHaveBeenCalledWith('prod-1')
    })

    it('should call removeFavourite when product is already favourited', async () => {
      useFavouritesStore.setState({ favouriteIds: ['prod-1'] })
      jest
        .mocked(removeFavouriteAction)
        .mockResolvedValue({ success: true, message: 'ok', data: null })

      await useFavouritesStore.getState().toggleFavourite('prod-1')

      expect(useFavouritesStore.getState().favouriteIds).not.toContain('prod-1')
      expect(removeFavouriteAction).toHaveBeenCalledWith('prod-1')
    })
  })

  describe('syncWithDatabase', () => {
    it('should fetch IDs and set favouriteIds', async () => {
      jest.mocked(getFavouritesAction).mockResolvedValue({
        success: true,
        message: 'ok',
        data: ['prod-1', 'prod-2'],
      })

      await useFavouritesStore.getState().syncWithDatabase()

      expect(useFavouritesStore.getState().favouriteIds).toEqual([
        'prod-1',
        'prod-2',
      ])
      expect(useFavouritesStore.getState().isLoading).toBe(false)
    })

    it('should handle fetch error gracefully', async () => {
      jest
        .mocked(getFavouritesAction)
        .mockRejectedValue(new Error('Fetch error'))
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await useFavouritesStore.getState().syncWithDatabase()

      expect(useFavouritesStore.getState().isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to sync favourites',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })
  })

  describe('setHydrated', () => {
    it('should set isHydrated to true', () => {
      useFavouritesStore.getState().setHydrated(true)

      expect(useFavouritesStore.getState().isHydrated).toBe(true)
    })

    it('should set isHydrated to false', () => {
      useFavouritesStore.getState().setHydrated(false)

      expect(useFavouritesStore.getState().isHydrated).toBe(false)
    })
  })
})
