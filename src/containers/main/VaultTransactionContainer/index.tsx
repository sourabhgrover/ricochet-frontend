import React, { useState, FC, useCallback, ChangeEvent } from 'react';
import { BankType } from 'store/banks/types';
import { useDispatch } from 'react-redux';
import { banksApproveToken, banksGetData, banksMakeTransaction } from 'store/banks/actionCreators';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { selectBanks } from 'store/banks/selectors';
import { VaultTransaction } from 'components/banks/VaultTransaction';

type Props = {
	bank: BankType;
	activeTransaction: string;
	transactionHash: string;
	setTransactionHash: (transactionHash: string) => void;
	setActiveTransaction: (transaction: string) => void;
	maxAvailableWithdraw: string;
	maxAvailableBorrow: string;
	maxAvailableDepositRIC?: string;
	maxAvailableDepositUSDCx?: string;
};

export const VaultTransactionContainer: FC<Props> = ({
	bank,
	activeTransaction,
	transactionHash,
	setTransactionHash,
	setActiveTransaction,
	maxAvailableWithdraw,
	maxAvailableBorrow,
	maxAvailableDepositRIC,
	maxAvailableDepositUSDCx,
}) => {
	const dispatch = useDispatch();
	const { isLoadingTransaction, isLoadingApprove } = useShallowSelector(selectBanks);
	const [value, setValue] = useState('');
	const [error, setError] = useState('');
	const [localApproved, setLocalApproved] = useState(false);

	const callbackAction = React.useCallback(
		(newTransactionHash: string, newError?: string) => {
			setTransactionHash(newTransactionHash);
			if (newError) {
				setError(newError);
			} else {
				dispatch(banksGetData());
				setActiveTransaction('');
			}
		},
		[dispatch, setActiveTransaction, setTransactionHash],
	);

	const callbackApprove = (newError?: string) => {
		if (newError) {
			setError(newError);
		} else setLocalApproved(true);
	};

	const handleMakeAction = useCallback(() => {
		if (+value > 0) {
			dispatch(banksMakeTransaction(activeTransaction, value, bank.bankAddress, callbackAction));
		}
	}, [activeTransaction, value, bank, callbackAction, dispatch]);

	const handleCancel = useCallback(() => {
		setValue('');
		setActiveTransaction('');
	}, [setActiveTransaction, setValue]);

	const handleMaxWithdraw = useCallback(() => {
		setValue(maxAvailableWithdraw);
	}, [setValue, maxAvailableWithdraw]);

	const handleMaxBorrow = useCallback(() => {
		setValue(maxAvailableBorrow);
	}, [setValue, maxAvailableBorrow]);

	const handleMaxDepositUSDCx = useCallback(() => {
		setValue(maxAvailableDepositUSDCx!);
	}, [setValue, maxAvailableDepositUSDCx]);

	const handleMaxDepositRIC = useCallback(() => {
		setValue(maxAvailableDepositRIC!);
	}, [setValue, maxAvailableDepositRIC]);

	const handleOnChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setValue(e.target.value);
		},
		[setValue],
	);

	const handleMaxRepay = useCallback(() => {
		setValue(String(+bank.vault.debtAmount / 1e18));
	}, [bank]);

	const handleApproveToken = useCallback(() => {
		dispatch(banksApproveToken(bank.debtToken.address, bank.bankAddress, bank.vault.debtAmount, callbackApprove));
	}, [dispatch, bank]);

	return (
		<VaultTransaction
			bank={bank}
			isLoadingTransaction={isLoadingTransaction}
			isLoadingApprove={isLoadingApprove}
			activeTransaction={activeTransaction}
			value={value}
			localApproved={localApproved}
			error={error}
			transactionHash={transactionHash}
			onCancel={handleCancel}
			onChange={handleOnChange}
			onMakeAction={handleMakeAction}
			onMaxRepay={handleMaxRepay}
			onMaxWithdraw={handleMaxWithdraw}
			onMaxBorrow={handleMaxBorrow}
			onMaxDepositUSDCx={handleMaxDepositUSDCx}
			onMaxDepositRIC={handleMaxDepositRIC}
			onApproveClick={handleApproveToken}
		/>
	);
};
