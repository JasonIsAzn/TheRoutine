using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using TheRoutineWeb.Models;

namespace TheRoutineWeb
{
    public class WorkoutCyclesController : Controller
    {
        private readonly AppDbContext _context;

        public WorkoutCyclesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: WorkoutCycles
        public async Task<IActionResult> Index()
        {
            var appDbContext = _context.WorkoutCycles.Include(w => w.User).Include(w => w.WorkoutPlan);
            return View(await appDbContext.ToListAsync());
        }

        // GET: WorkoutCycles/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutCycle = await _context.WorkoutCycles
                .Include(w => w.User)
                .Include(w => w.WorkoutPlan)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (workoutCycle == null)
            {
                return NotFound();
            }

            return View(workoutCycle);
        }

        // GET: WorkoutCycles/Create
        public IActionResult Create()
        {
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id");
            ViewData["WorkoutPlanId"] = new SelectList(_context.WorkoutPlans, "Id", "Id");
            return View();
        }

        // POST: WorkoutCycles/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,UserId,WorkoutPlanId,StartDate,DayOrderMap,IsActive,CreatedAt")] WorkoutCycle workoutCycle)
        {
            if (ModelState.IsValid)
            {
                _context.Add(workoutCycle);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id", workoutCycle.UserId);
            ViewData["WorkoutPlanId"] = new SelectList(_context.WorkoutPlans, "Id", "Id", workoutCycle.WorkoutPlanId);
            return View(workoutCycle);
        }

        // GET: WorkoutCycles/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutCycle = await _context.WorkoutCycles.FindAsync(id);
            if (workoutCycle == null)
            {
                return NotFound();
            }
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id", workoutCycle.UserId);
            ViewData["WorkoutPlanId"] = new SelectList(_context.WorkoutPlans, "Id", "Id", workoutCycle.WorkoutPlanId);
            return View(workoutCycle);
        }

        // POST: WorkoutCycles/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,UserId,WorkoutPlanId,StartDate,DayOrderMap,IsActive,CreatedAt")] WorkoutCycle workoutCycle)
        {
            if (id != workoutCycle.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(workoutCycle);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!WorkoutCycleExists(workoutCycle.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["UserId"] = new SelectList(_context.Users, "Id", "Id", workoutCycle.UserId);
            ViewData["WorkoutPlanId"] = new SelectList(_context.WorkoutPlans, "Id", "Id", workoutCycle.WorkoutPlanId);
            return View(workoutCycle);
        }

        // GET: WorkoutCycles/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var workoutCycle = await _context.WorkoutCycles
                .Include(w => w.User)
                .Include(w => w.WorkoutPlan)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (workoutCycle == null)
            {
                return NotFound();
            }

            return View(workoutCycle);
        }

        // POST: WorkoutCycles/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var workoutCycle = await _context.WorkoutCycles.FindAsync(id);
            if (workoutCycle != null)
            {
                _context.WorkoutCycles.Remove(workoutCycle);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool WorkoutCycleExists(int id)
        {
            return _context.WorkoutCycles.Any(e => e.Id == id);
        }
    }
}
