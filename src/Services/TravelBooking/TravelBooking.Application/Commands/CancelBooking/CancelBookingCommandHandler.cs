using MediatR;
using TravelBooking.Domain.Interfaces;

namespace TravelBooking.Application.Commands.CancelBooking;

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand, bool>
{
    private readonly IBookingRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelBookingCommandHandler(IBookingRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _repository.GetByIdAsync(request.BookingId, cancellationToken);
        if (booking is null) return false;

        booking.Cancel(request.Reason);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
