import { setModalState, type ModalKey } from "@/app/features/nav/nav.slice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

const useModal = <T extends object | null>(modalKey: ModalKey) => {
  const dispatch = useAppDispatch();
  const modalState = useAppSelector((state) => state.nav.modals[modalKey]);

  const openModal = () => {
    dispatch(
      setModalState({
        key: modalKey,
        state: { isOpen: true },
      }),
    );
  };

  const closeModal = () => {
    dispatch(
      setModalState({
        key: modalKey,
        state: { isOpen: false },
      }),
    );
  };

  const setPayload = (payload: T | null) => {
    dispatch(
      setModalState({
        key: modalKey,
        state: { payload },
      }),
    );
  };

  return {
    isOpen: modalState?.isOpen ?? false,
    payload: modalState?.payload as T | undefined,
    openModal,
    closeModal,
    setPayload,
  };
};

export default useModal;
